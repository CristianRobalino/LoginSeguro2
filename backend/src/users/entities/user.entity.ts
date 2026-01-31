import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { Credential } from './credential.entity';

/**
 * Entidad User - Representa un usuario del sistema
 * Aplica Single Responsibility Principle: solo maneja datos de usuario
 */
@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, length: 255 })
    email: string;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'varchar', nullable: true, length: 255 })
    password: string | null; // Hash de la contraseña (bcrypt)

    @Column('float', { array: true, nullable: true })
    faceDescriptor: number[] | null; // Descriptor facial de 128 dimensiones

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.CLIENT,
    })
    role: Role;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relación uno a muchos con credenciales biométricas
    @OneToMany(() => Credential, (credential) => credential.user, {
        cascade: true,
        eager: false,
    })
    credentials: Credential[];
}
