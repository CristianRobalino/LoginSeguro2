import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

/**
 * Users Controller - Controlador de gestión de usuarios
 * Todas las rutas requieren autenticación JWT
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * POST /users
     * Crear nuevo usuario (solo Admin)
     */
    @Post()
    @Roles(Role.ADMIN)
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    /**
     * POST /users/create-by-admin
     * Crear usuario SIN descriptor facial (solo Admin)
     * El usuario completará su registro facial en el primer login
     */
    @Post('create-by-admin')
    @Roles(Role.ADMIN)
    createByAdmin(@Body() createUserDto: CreateUserByAdminDto) {
        return this.usersService.createByAdmin(createUserDto);
    }

    /**
     * GET /users
     * Listar todos los usuarios (solo Admin)
     */
    @Get()
    @Roles(Role.ADMIN)
    findAll() {
        return this.usersService.findAll();
    }

    /**
     * GET /users/search?email=...
     * Buscar usuarios por email (solo Admin)
     */
    @Get('search')
    @Roles(Role.ADMIN)
    search(@Query('email') email: string) {
        return this.usersService.searchByEmail(email);
    }

    /**
     * GET /users/:id
     * Obtener un usuario por ID
     * Admin: puede ver cualquier usuario
     * Cliente: solo puede ver su propio perfil
     */
    @Get(':id')
    @Roles(Role.ADMIN, Role.CLIENT)
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.usersService.findOne(id);
    }

    /**
     * PATCH /users/:id
     * Actualizar usuario
     * Admin: puede actualizar cualquier usuario
     * Cliente: solo puede actualizar su propio perfil (campos limitados)
     */
    @Patch(':id')
    @Roles(Role.ADMIN, Role.CLIENT)
    update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUser() user: any,
    ) {
        return this.usersService.update(id, updateUserDto, user);
    }

    /**
     * DELETE /users/:id
     * Eliminar usuario (solo Admin)
     */
    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
