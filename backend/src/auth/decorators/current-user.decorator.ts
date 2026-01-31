import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador @CurrentUser - Obtiene el usuario actual del request
 * Uso: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
