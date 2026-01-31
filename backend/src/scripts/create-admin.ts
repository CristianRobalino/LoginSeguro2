import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { AuditLog } from '../users/entities/audit-log.entity';

/**
 * Script simplificado para crear usuario admin con descriptor facial dummy
 * Usa credenciales directas de docker-compose.yml
 */
async function createAdmin() {
    // Configuración directa (sin .env)
    const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'admin',
        password: 'admin123',
        database: 'login_seguro',
        entities: [User, AuditLog],
        synchronize: false,
    });

    try {
        console.log('🔌 Conectando a PostgreSQL...');
        await dataSource.initialize();
        console.log('✅ Conectado exitosamente');

        const userRepository = dataSource.getRepository(User);

        const adminEmail = 'cirobalino@espe.edu.ec';

        // Verificar si existe
        const existing = await userRepository.findOne({
            where: { email: adminEmail },
        });

        if (existing) {
            console.log('⚠️  El usuario ya existe:');
            console.log(`   Email: ${existing.email}`);
            console.log(`   Nombre: ${existing.name}`);
            console.log(`   Rol: ${existing.role}`);
            console.log(`   Activo: ${existing.isActive}`);

            if (!existing.isActive || !existing.faceDescriptor) {
                console.log('\n🔄 Actualizando usuario...');
                const dummyDescriptor = Array.from({ length: 128 }, () => (Math.random() * 2) - 1);
                existing.faceDescriptor = dummyDescriptor;
                existing.isActive = true;
                await userRepository.save(existing);
                console.log('✅ Usuario actualizado y activado');
            }

            await dataSource.destroy();
            return;
        }

        console.log('👤 Creando usuario admin...');

        // Hash de contraseña
        const hashedPassword = await bcrypt.hash('cris112cr', 10);

        // Descriptor facial dummy
        const dummyDescriptor = Array.from({ length: 128 }, () => (Math.random() * 2) - 1);

        // Crear usuario
        const admin = userRepository.create({
            name: 'Cristian Isaak Robalino Curay',
            email: adminEmail,
            password: hashedPassword,
            role: Role.ADMIN,
            isActive: true,
            faceDescriptor: dummyDescriptor,
        });

        await userRepository.save(admin);

        console.log('✅ Usuario admin creado exitosamente!');
        console.log('\n📋 Credenciales:');
        console.log('   Nombre: Cristian Isaak Robalino Curay');
        console.log('   Email: cirobalino@espe.edu.ec');
        console.log('   Contraseña: cris112cr');
        console.log('   Rol: ADMIN');
        console.log('   Estado: ACTIVO');
        console.log('\n⚠️  NOTA:');
        console.log('   - Descriptor facial es DUMMY (para desarrollo)');
        console.log('   - Puedes hacer login en http://localhost:3000/login');
        console.log('   - La verificación facial aceptará cualquier rostro');

        await dataSource.destroy();
        console.log('\n🔌 Desconectado');
    } catch (error) {
        console.error('❌ Error:', error.message);
        await dataSource.destroy();
        process.exit(1);
    }
}

createAdmin();
