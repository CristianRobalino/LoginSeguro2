import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Ip,
    Headers,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { StartRegistrationDto } from './dto/start-registration.dto';
import { VerifyFaceRegistrationDto } from './dto/verify-face-registration.dto';
import { CompleteFaceRegistrationDto } from './dto/complete-face-registration.dto';
import { StartAuthenticationDto } from './dto/start-authentication.dto';
import { VerifyFaceAuthenticationDto } from './dto/verify-face-authentication.dto';

/**
 * Auth Controller - Controlador de autenticación con reconocimiento facial
 * Maneja endpoints públicos de registro y login
 */
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * POST /auth/register/start
     * Inicia el proceso de registro (credenciales)
     */
    @Post('register/start')
    @HttpCode(HttpStatus.OK)
    async startRegistration(
        @Body() dto: StartRegistrationDto,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
    ) {
        return this.authService.startRegistration(dto, ip, userAgent);
    }

    /**
     * POST /auth/register/verify-face
     * Verifica y completa el registro facial
     */
    @Post('register/verify-face')
    @HttpCode(HttpStatus.CREATED)
    async verifyFaceRegistration(
        @Body() dto: VerifyFaceRegistrationDto,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
    ) {
        return this.authService.verifyFaceRegistration(dto, ip, userAgent);
    }

    /**
     * POST /auth/complete-face-registration
     * Completa el registro facial de un usuario existente (creado por admin)
     */
    @Post('complete-face-registration')
    @HttpCode(HttpStatus.OK)
    async completeFaceRegistration(
        @Body() dto: CompleteFaceRegistrationDto,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
    ) {
        return this.authService.completeFaceRegistration(dto, ip, userAgent);
    }

    /**
     * POST /auth/login/start
     * Inicia el proceso de autenticación (valida credenciales)
     */
    @Post('login/start')
    @HttpCode(HttpStatus.OK)
    async startAuthentication(
        @Body() dto: StartAuthenticationDto,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
    ) {
        return this.authService.startAuthentication(dto, ip, userAgent);
    }

    /**
     * POST /auth/login/verify-face
     * Verifica la autenticación facial y retorna JWT
     */
    @Post('login/verify-face')
    @HttpCode(HttpStatus.OK)
    async verifyFaceAuthentication(
        @Body() dto: VerifyFaceAuthenticationDto,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
    ) {
        return this.authService.verifyFaceAuthentication(dto, ip, userAgent);
    }
}
