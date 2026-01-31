import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * Entidad AuditLog - Registro de eventos de seguridad
 * Cumple con requisitos de auditoría y trazabilidad
 */
@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    action: string; // 'login', 'logout', 'register', 'update_profile', etc.

    @Column({ type: 'text', nullable: true })
    details: string;

    @Column({ length: 45, nullable: true, name: 'ip_address' })
    ipAddress: string;

    @Column({ length: 500, nullable: true, name: 'user_agent' })
    userAgent: string;

    @Column({ default: true })
    success: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
