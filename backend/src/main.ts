import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
// Cargar variables de entorno antes de importar AppModule
dotenv.config();

import { AppModule } from './app.module';

/**
 * Bootstrap - Punto de entrada de la aplicación
 * Configura seguridad, validación y CORS
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Helmet - Headers de seguridad
  app.use(helmet());

  // CORS - Configuración segura
  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true, // Transforma payloads a instancias de DTO
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`🚀 Backend corriendo en http://localhost:${port}/api`);
  console.log(`🔒 Modo: ${configService.get('NODE_ENV')}`);
}

bootstrap();
