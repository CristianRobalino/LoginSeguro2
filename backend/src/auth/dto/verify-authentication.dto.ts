import { IsEmail, IsNotEmpty, IsObject } from 'class-validator';

/**
 * DTO para verificar la autenticación biométrica
 */
export class VerifyAuthenticationDto {
    @IsEmail({}, { message: 'El email debe ser válido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;

    @IsObject({ message: 'La respuesta de autenticación debe ser un objeto' })
    @IsNotEmpty({ message: 'La respuesta de autenticación es requerida' })
    authenticationResponse: any; // AuthenticationResponseJSON de @simplewebauthn/types
}
