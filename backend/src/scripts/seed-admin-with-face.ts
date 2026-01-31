import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';

/**
 * Script para crear usuario administrador CON descriptor facial dummy
 * Esto permite login inmediato sin necesidad de registro facial
 * SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN
 * 
 * Ejecutar con: npm run seed:admin:dev
 */
async function seedAdminWithFace() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USER || 'admin',
        password: process.env.DATABASE_PASSWORD || 'admin123',
        database: process.env.DATABASE_NAME || 'login_seguro',
        entities: [User],
        synchronize: false,
    });

    try {
        console.log('🔌 Conectando a la base de datos...');
        await dataSource.initialize();
        console.log('✅ Conexión establecida');

        const userRepository = dataSource.getRepository(User);

        const adminData = {
            name: 'Cristian Isaak Robalino Curay',
            email: 'cirobalino@espe.edu.ec',
            password: 'cris112cr',
            role: Role.ADMIN,
        };

        // Verificar si existe
        const existingAdmin = await userRepository.findOne({
            where: { email: adminData.email },
        });

        if (existingAdmin) {
            console.log('⚠️  El usuario admin ya existe');

            // Actualizar para activarlo si está inactivo
            if (!existingAdmin.isActive) {
                console.log('🔄 Activando usuario y agregando descriptor facial dummy...');

                // Generar descriptor facial dummy (128 números aleatorios)
                const dummyDescriptor = Array.from({ length: 128 }, () => Math.random());

                existingAdmin.faceDescriptor = dummyDescriptor;
                existingAdmin.isActive = true;

                await userRepository.save(existingAdmin);

                console.log('✅ Usuario activado con descriptor facial dummy');
                console.log('⚠️  ADVERTENCIA: Este descriptor es DUMMY, cualquier rostro coincidirá');
                console.log('💡 Recomendación: Completa el registro facial real desde el frontend');
            } else {
                console.log('✅ El usuario ya está activo');
            }

            await dataSource.destroy();
            return;
        }

        console.log('👤 Creando usuario administrador con descriptor facial dummy...');

        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        // Generar descriptor facial dummy (128 números aleatorios entre -1 y 1)
        const dummyDescriptor = Array.from({ length: 128 }, () => (Math.random() * 2) - 1);

        const admin = userRepository.create({
            name: adminData.name,
            email: adminData.email,
            password: hashedPassword,
            role: adminData.role,
            isActive: true, // Activado inmediatamente
            faceDescriptor: dummyDescriptor,
        });

        await userRepository.save(admin);

        console.log('✅ Usuario administrador creado y activado');
        console.log('\n📋 Credenciales:');
        console.log(`   Nombre: ${adminData.name}`);
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Contraseña: ${adminData.password}`);
        console.log(`   Rol: ${adminData.role}`);
        console.log(`   Estado: ACTIVO`);
        console.log('\n⚠️  ADVERTENCIA:');
        console.log('   - El descriptor facial es DUMMY (números aleatorios)');
        console.log('   - Cualquier rostro podría coincidir en el login');
        console.log('   - Esto es SOLO para desarrollo/pruebas');
        console.log('\n💡 Para usar en producción:');
        console.log('   1. Elimina este usuario');
        console.log('   2. Ejecuta seed-admin.ts');
        console.log('   3. Completa el registro facial desde el frontend');

        await dataSource.destroy();
        console.log('\n🔌 Conexión cerrada');
    } catch (error) {
        console.error('❌ Error:', error);
        await dataSource.destroy();
        process.exit(1);
    }
}

seedAdminWithFace();
