import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { Role } from '../common/enums/role.enum';

/**
 * Users Service - Servicio de gestión de usuarios
 * Aplica Repository Pattern y Single Responsibility Principle
 */
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    /**
     * Crear un nuevo usuario (solo Admin)
     * El usuario debe completar el registro biométrico después
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        // Verificar si el email ya existe
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('El email ya está registrado');
        }

        const user = this.userRepository.create(createUserDto);
        return await this.userRepository.save(user);
    }

    /**
     * Crear usuario por Admin SIN descriptor facial
     * El usuario completará su registro facial en el primer login
     */
    async createByAdmin(createUserDto: CreateUserByAdminDto): Promise<User> {
        // Verificar si el email ya existe
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('El email ya está registrado');
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        // Crear usuario SIN descriptor facial y SIN activar
        const user = this.userRepository.create({
            email: createUserDto.email,
            name: createUserDto.name,
            password: hashedPassword,
            role: createUserDto.role || Role.CLIENT,
            isActive: false, // Se activará al completar registro facial
            faceDescriptor: null,
        });

        return await this.userRepository.save(user);
    }

    /**
     * Obtener todos los usuarios (solo Admin)
     */
    async findAll(): Promise<User[]> {
        return await this.userRepository.find({
            select: ['id', 'email', 'name', 'role', 'isActive', 'createdAt', 'updatedAt'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Obtener un usuario por ID
     */
    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'email', 'name', 'role', 'isActive', 'createdAt', 'updatedAt'],
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return user;
    }

    /**
     * Actualizar usuario
     * Admin puede actualizar cualquier usuario
     * Cliente solo puede actualizar su propio perfil (campos limitados)
     */
    async update(
        id: string,
        updateUserDto: UpdateUserDto,
        currentUser: any,
    ): Promise<User> {
        const user = await this.findOne(id);

        // Si no es admin, solo puede actualizar su propio perfil
        if (currentUser.role !== Role.ADMIN && currentUser.id !== id) {
            throw new ForbiddenException('No tienes permiso para actualizar este usuario');
        }

        // Si es cliente, solo puede actualizar nombre (no rol ni estado)
        if (currentUser.role === Role.CLIENT) {
            const { name } = updateUserDto;
            if (name) user.name = name;
        } else {
            // Admin puede actualizar todo
            Object.assign(user, updateUserDto);
        }

        return await this.userRepository.save(user);
    }

    /**
     * Eliminar usuario (solo Admin)
     */
    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }

    /**
     * Buscar usuarios por email (para búsqueda en dashboard admin)
     */
    async searchByEmail(email: string): Promise<User[]> {
        return await this.userRepository
            .createQueryBuilder('user')
            .where('user.email ILIKE :email', { email: `%${email}%` })
            .select(['user.id', 'user.email', 'user.name', 'user.role', 'user.isActive'])
            .getMany();
    }
}
