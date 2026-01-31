import { IsNotEmpty, IsObject } from 'class-validator';

/**
 * DTO para verificar el registro biométrico
 */
export class VerifyRegistrationDto {
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;

    @IsObject({ message: 'La respuesta de registro debe ser un objeto' })
    @IsNotEmpty({ message: 'La respuesta de registro es requerida' })
    registrationResponse: any; // RegistrationResponseJSON de @simplewebauthn/types
}
