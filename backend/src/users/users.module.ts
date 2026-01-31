import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Credential } from './entities/credential.entity';
import { AuditLog } from './entities/audit-log.entity';

/**
 * Users Module - Módulo de gestión de usuarios
 */
@Module({
    imports: [TypeOrmModule.forFeature([User, Credential, AuditLog])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
