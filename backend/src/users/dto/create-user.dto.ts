import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

/**
 * DTO para creación de usuario
 * Aplica validación estricta para prevenir inyecciones
 */
export class CreateUserDto {
    @IsEmail({}, { message: 'El email debe ser válido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;

    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    name: string;

    @IsEnum(Role, { message: 'El rol debe ser admin o client' })
    @IsNotEmpty({ message: 'El rol es requerido' })
    role: Role;
}
