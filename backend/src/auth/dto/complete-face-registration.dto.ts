import { IsEmail, IsNotEmpty, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

/**
 * DTO para completar registro facial de usuario existente
 */
export class CompleteFaceRegistrationDto {
    @IsEmail({}, { message: 'El email debe ser válido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;

    @IsArray({ message: 'El descriptor facial debe ser un array' })
    @ArrayMinSize(128, { message: 'El descriptor facial debe tener 128 elementos' })
    @ArrayMaxSize(128, { message: 'El descriptor facial debe tener 128 elementos' })
    faceDescriptor: number[];
}
