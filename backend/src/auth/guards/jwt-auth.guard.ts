import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Auth Guard - Guard para proteger rutas con JWT
 * Aplica Guard Pattern
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
