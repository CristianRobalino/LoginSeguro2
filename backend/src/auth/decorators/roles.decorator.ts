import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorador @Roles - Especifica roles permitidos para una ruta
 * Uso: @Roles(Role.ADMIN, Role.CLIENT)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
