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
 * Entidad Credential - Almacena claves públicas de WebAuthn
 * IMPORTANTE: La clave privada NUNCA sale del dispositivo del usuario
 * Solo almacenamos la clave pública para verificar firmas
 */
@Entity('credentials')
export class Credential {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // ID único de la credencial generado por el autenticador
    @Column({ unique: true, name: 'credential_id', length: 1024 })
    credentialID: string;

    // Clave pública en formato Base64 (NO es la clave privada)
    @Column({ type: 'text', name: 'public_key' })
    publicKey: string;

    // Contador para prevenir replay attacks
    // Se incrementa cada vez que se usa la credencial
    @Column({ type: 'bigint', default: 0 })
    counter: bigint;

    // Tipo de transporte usado (usb, nfc, ble, internal)
    @Column({ type: 'simple-array', nullable: true })
    transports: string[];

    // Nombre descriptivo del dispositivo
    @Column({ length: 255, nullable: true })
    deviceName: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relación muchos a uno con usuario
    @ManyToOne(() => User, (user) => user.credentials, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
