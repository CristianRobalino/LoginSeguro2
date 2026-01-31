import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para iniciar el proceso de autenticación
 */
export class StartAuthenticationDto {
    @IsEmail({}, { message: 'El email debe ser válido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;

    @IsString({ message: 'La contraseña debe ser un texto' })
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    password: string;
}
