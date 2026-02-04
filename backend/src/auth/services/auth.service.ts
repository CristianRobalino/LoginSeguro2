import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { AuditLog } from '../../users/entities/audit-log.entity';
import { StartRegistrationDto } from '../dto/start-registration.dto';
import { VerifyFaceRegistrationDto } from '../dto/verify-face-registration.dto';
import { CompleteFaceRegistrationDto } from '../dto/complete-face-registration.dto';
import { StartAuthenticationDto } from '../dto/start-authentication.dto';
import { VerifyFaceAuthenticationDto } from '../dto/verify-face-authentication.dto';
import { Role } from '../../common/enums/role.enum';

/**
 * AuthService - Servicio principal de autenticación con reconocimiento facial
 * Aplica Single Responsibility Principle: maneja autenticación y autorización
 * Aplica Dependency Inversion: depende de abstracciones (Repository, JwtService)
 */
@Injectable()
export class AuthService {
    // Threshold para comparación de descriptores faciales
    private readonly FACE_MATCH_THRESHOLD = 0.6;
    private readonly SALT_ROUNDS = 10;

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
        private jwtService: JwtService,
    ) { }

    /**
     * Inicia el proceso de registro
     * Crea usuario con credenciales (email, password, nombre)
     */
    async startRegistration(dto: StartRegistrationDto, ipAddress?: string, userAgent?: string) {
        // Verificar si el usuario ya existe
        const existingUser = await this.userRepository.findOne({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('El usuario ya existe');
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

        // Crear usuario (sin activar hasta que se verifique el rostro)
        const user = this.userRepository.create({
            email: dto.email,
            name: dto.name,
            password: hashedPassword,
            role: Role.CLIENT, // Por defecto es cliente
            isActive: false, // Se activará al verificar rostro
        });

        await this.userRepository.save(user);

        // Registrar intento en auditoría
        await this.createAuditLog(
            'registration_started',
            user,
            `Inicio de registro para ${dto.email}`,
            ipAddress,
            userAgent,
            true,
        );

        return {
            message: 'Usuario creado. Por favor completa el registro facial.',
            userId: user.id,
        };
    }

    /**
     * Verifica el registro facial y activa el usuario
     */
    async verifyFaceRegistration(dto: VerifyFaceRegistrationDto, ipAddress?: string, userAgent?: string) {
        // Buscar usuario
        const user = await this.userRepository.findOne({
            where: { email: dto.email },
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        if (user.isActive) {
            throw new BadRequestException('El usuario ya está activo');
        }

        // Validar descriptor facial
        if (!dto.faceDescriptor || dto.faceDescriptor.length !== 128) {
            throw new BadRequestException('Descriptor facial inválido. Debe tener 128 elementos.');
        }

        // VALIDACIÓN: Verificar que el rostro no esté ya registrado
        await this.checkDuplicateFace(dto.faceDescriptor, dto.email);

        // Guardar descriptor facial
        user.faceDescriptor = dto.faceDescriptor;
        user.isActive = true;

        await this.userRepository.save(user);

        // Registrar en auditoría
        await this.createAuditLog(
            'registration_completed',
            user,
            `Registro facial completado para ${dto.email}`,
            ipAddress,
            userAgent,
            true,
        );

        return {
            message: 'Registro completado exitosamente',
            userId: user.id,
        };
    }

    /**
     * Completa el registro facial de un usuario existente (creado por admin)
     */
    async completeFaceRegistration(dto: CompleteFaceRegistrationDto, ipAddress?: string, userAgent?: string) {
        // Buscar usuario
        const user = await this.userRepository.findOne({
            where: { email: dto.email },
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        if (user.faceDescriptor && user.faceDescriptor.length === 128) {
            throw new BadRequestException('El usuario ya tiene registro facial');
        }

        // Validar descriptor facial
        if (!dto.faceDescriptor || dto.faceDescriptor.length !== 128) {
            throw new BadRequestException('Descriptor facial inválido. Debe tener 128 elementos.');
        }

        // VALIDACIÓN: Verificar que el rostro no esté ya registrado
        await this.checkDuplicateFace(dto.faceDescriptor, dto.email);

        // Guardar descriptor facial y activar usuario
        user.faceDescriptor = dto.faceDescriptor;
        user.isActive = true;

        await this.userRepository.save(user);

        // Registrar en auditoría
        await this.createAuditLog(
            'face_registration_completed',
            user,
            `Registro facial completado para ${dto.email}`,
            ipAddress,
            userAgent,
            true,
        );

        return {
            message: 'Registro facial completado exitosamente',
            userId: user.id,
        };
    }

    /**
     * Inicia el proceso de autenticación
     * Valida email y contraseña
     */
    async startAuthentication(dto: StartAuthenticationDto, ipAddress?: string, userAgent?: string) {
        // Buscar usuario (permitir usuarios inactivos si no tienen rostro)
        const user = await this.userRepository.findOne({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Verificar que el usuario tenga contraseña
        if (!user.password) {
            throw new UnauthorizedException('Usuario sin contraseña configurada');
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            await this.createAuditLog(
                'login_failed',
                user,
                `Contraseña incorrecta para ${dto.email}`,
                ipAddress,
                userAgent,
                false,
            );

            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Verificar si tiene descriptor facial
        const hasFaceDescriptor = user.faceDescriptor && user.faceDescriptor.length === 128;

        if (!hasFaceDescriptor) {
            // Usuario sin rostro - necesita completar registro facial
            await this.createAuditLog(
                'login_credentials_validated',
                user,
                `Credenciales validadas para ${dto.email}. Usuario sin registro facial.`,
                ipAddress,
                userAgent,
                true,
            );

            return {
                message: 'Credenciales válidas. Debes completar tu registro facial.',
                requiresFaceRegistration: true, // Indica que necesita REGISTRAR rostro
                requiresFaceVerification: false,
            };
        }

        // Usuario con rostro - continuar con verificación
        await this.createAuditLog(
            'login_credentials_validated',
            user,
            `Credenciales validadas para ${dto.email}. Esperando verificación facial.`,
            ipAddress,
            userAgent,
            true,
        );

        return {
            message: 'Credenciales válidas. Por favor completa la verificación facial.',
            requiresFaceRegistration: false,
            requiresFaceVerification: true, // Indica que necesita VERIFICAR rostro
        };
    }

    /**
     * Verifica la autenticación facial y genera JWT
     */
    async verifyFaceAuthentication(dto: VerifyFaceAuthenticationDto, ipAddress?: string, userAgent?: string) {
        // Buscar usuario
        const user = await this.userRepository.findOne({
            where: { email: dto.email, isActive: true },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        // Validar descriptor facial
        if (!dto.faceDescriptor || dto.faceDescriptor.length !== 128) {
            throw new BadRequestException('Descriptor facial inválido');
        }

        if (!user.faceDescriptor || user.faceDescriptor.length !== 128) {
            throw new BadRequestException('Usuario sin registro facial');
        }

        // Comparar descriptores faciales
        const distance = this.compareFaceDescriptors(user.faceDescriptor, dto.faceDescriptor);
        const isMatch = distance < this.FACE_MATCH_THRESHOLD;

        if (!isMatch) {
            await this.createAuditLog(
                'login_face_failed',
                user,
                `Verificación facial fallida para ${dto.email}. Distancia: ${distance.toFixed(4)}`,
                ipAddress,
                userAgent,
                false,
            );

            throw new UnauthorizedException('Rostro no coincide. Por favor intenta de nuevo.');
        }

        // Generar JWT
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        // Registrar login exitoso
        await this.createAuditLog(
            'login_success',
            user,
            `Login exitoso para ${dto.email}. Distancia facial: ${distance.toFixed(4)}`,
            ipAddress,
            userAgent,
            true,
        );

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    /**
     * Verifica si un descriptor facial ya está registrado en el sistema
     * Previene que un usuario cree múltiples cuentas con el mismo rostro
     */
    private async checkDuplicateFace(newDescriptor: number[], excludeEmail?: string): Promise<void> {
        // Obtener todos los usuarios con descriptor facial registrado
        const usersWithFaces = await this.userRepository.find({
            where: {},
            select: ['id', 'email', 'faceDescriptor'],
        });

        // Filtrar usuarios que tienen descriptor facial válido
        const validUsers = usersWithFaces.filter(
            user => user.faceDescriptor &&
                user.faceDescriptor.length === 128 &&
                user.email !== excludeEmail // Excluir el email actual (para actualizaciones)
        );

        // Comparar el nuevo descriptor con cada descriptor existente
        for (const existingUser of validUsers) {
            // TypeScript safety: verificar que el descriptor existe
            if (!existingUser.faceDescriptor) continue;

            const distance = this.compareFaceDescriptors(
                existingUser.faceDescriptor,
                newDescriptor
            );

            // Si la distancia es menor al umbral, es el mismo rostro
            if (distance < this.FACE_MATCH_THRESHOLD) {
                // Registrar intento de duplicación en auditoría
                await this.createAuditLog(
                    'duplicate_face_attempt',
                    null,
                    `Intento de registro con rostro duplicado. Coincide con usuario: ${existingUser.email}`,
                    undefined,
                    undefined,
                    false,
                );

                throw new ConflictException(
                    'Este rostro ya está registrado en el sistema. Si ya tienes una cuenta, por favor inicia sesión.'
                );
            }
        }
    }

    /**
     * Compara dos descriptores faciales usando distancia euclidiana
     * Retorna la distancia (menor = más similar)
     */
    private compareFaceDescriptors(stored: number[], current: number[]): number {
        if (stored.length !== current.length) {
            throw new BadRequestException('Los descriptores deben tener la misma longitud');
        }

        // Calcular distancia euclidiana
        const sumOfSquares = stored.reduce(
            (sum, val, i) => sum + Math.pow(val - current[i], 2),
            0
        );

        return Math.sqrt(sumOfSquares);
    }

    /**
     * Crea un registro de auditoría
     * Aplica Single Responsibility: método dedicado a auditoría
     */
    private async createAuditLog(
        action: string,
        user: User | null,
        details: string,
        ipAddress?: string,
        userAgent?: string,
        success: boolean = true,
    ): Promise<void> {
        const log = this.auditLogRepository.create({
            action,
            user: user || undefined,
            details,
            ipAddress,
            userAgent,
            success,
        });

        await this.auditLogRepository.save(log);
    }
}
