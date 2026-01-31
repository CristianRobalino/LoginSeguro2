import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * DTO para actualización de usuario
 * Todos los campos son opcionales
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    @IsBoolean({ message: 'isActive debe ser un valor booleano' })
    isActive?: boolean;
}
