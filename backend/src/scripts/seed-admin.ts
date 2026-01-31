import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';

/**
 * Script para crear usuario administrador
 * Ejecutar con: npm run seed:admin
 */
async function seedAdmin() {
    // Configuración de conexión a la base de datos
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

        // Credenciales del admin
        const adminData = {
            name: 'Cristian Isaak Robalino Curay',
            email: 'cirobalino@espe.edu.ec',
            password: 'cris112cr',
            role: Role.ADMIN,
        };

        // Verificar si el admin ya existe
        const existingAdmin = await userRepository.findOne({
            where: { email: adminData.email },
        });

        if (existingAdmin) {
            console.log('⚠️  El usuario admin ya existe');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Nombre: ${existingAdmin.name}`);
            console.log(`   Rol: ${existingAdmin.role}`);
            console.log(`   Activo: ${existingAdmin.isActive}`);

            // Preguntar si quiere actualizar
            console.log('\n💡 Para actualizar, elimina el usuario primero o modifica este script');
            await dataSource.destroy();
            return;
        }

        console.log('👤 Creando usuario administrador...');

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        // Crear usuario admin SIN descriptor facial
        // El admin deberá completar el registro facial desde el frontend
        const admin = userRepository.create({
            name: adminData.name,
            email: adminData.email,
            password: hashedPassword,
            role: adminData.role,
            isActive: false, // Se activará al completar registro facial
            faceDescriptor: null,
        });

        await userRepository.save(admin);

        console.log('✅ Usuario administrador creado exitosamente');
        console.log('\n📋 Credenciales:');
        console.log(`   Nombre: ${adminData.name}`);
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Contraseña: ${adminData.password}`);
        console.log(`   Rol: ${adminData.role}`);
        console.log('\n⚠️  IMPORTANTE:');
        console.log('   1. El usuario está INACTIVO hasta completar el registro facial');
        console.log('   2. Ve a http://localhost:3000/register');
        console.log('   3. Usa el email: cirobalino@espe.edu.ec');
        console.log('   4. Completa SOLO el paso 2 (captura facial)');
        console.log('   5. O ejecuta el script seed-admin-with-face.ts para activarlo sin facial');

        await dataSource.destroy();
        console.log('\n🔌 Conexión cerrada');
    } catch (error) {
        console.error('❌ Error al crear usuario admin:', error);
        await dataSource.destroy();
        process.exit(1);
    }
}

// Ejecutar el script
seedAdmin();
