import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Roles Guard - Guard para control de acceso basado en roles
 * Aplica Guard Pattern y Open/Closed Principle
 * Extensible sin modificar código existente
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Obtener roles requeridos del decorador @Roles()
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Si no hay roles requeridos, permitir acceso
        if (!requiredRoles) {
            return true;
        }

        // Obtener usuario del request (inyectado por JwtStrategy)
        const { user } = context.switchToHttp().getRequest();

        // Verificar si el usuario tiene alguno de los roles requeridos
        return requiredRoles.some((role) => user.role === role);
    }
}
