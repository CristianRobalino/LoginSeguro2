# 🔐 Login Seguro - Sistema de Autenticación Biométrica

Sistema de autenticación full stack con **WebAuthn/FIDO2** para reconocimiento biométrico (facial, huella digital) en navegadores web.

## 📋 Descripción

Aplicación de login seguro que utiliza la autenticación biométrica del dispositivo (Windows Hello, Touch ID, Face ID) para proporcionar una capa adicional de seguridad sin almacenar datos biométricos sensibles.

### ✨ Características Principales

- ✅ **Autenticación biométrica** con WebAuthn/FIDO2
- ✅ **Roles diferenciados**: Admin y Cliente
- ✅ **Dashboard personalizado** según rol
- ✅ **Gestión de usuarios** (solo Admin)
- ✅ **Auditoría de seguridad** con logs
- ✅ **Diseño moderno** con glassmorphism y modo oscuro
- ✅ **Responsive** y accesible
- ✅ **Protección contra ataques** (XSS, CSRF, SQL Injection, Replay)

## 🧱 Stack Tecnológico

### Frontend
- **Next.js 16** (React + TypeScript)
- **Tailwind CSS** para estilos
- **@simplewebauthn/browser** para WebAuthn
- **Zustand** para state management
- **Axios** para HTTP client

### Backend
- **NestJS** (Node.js + TypeScript)
- **@simplewebauthn/server** para WebAuthn
- **TypeORM** + **PostgreSQL** para base de datos
- **JWT** para tokens de sesión
- **Passport** para autenticación
- **Helmet** para seguridad HTTP

### Base de Datos
- **PostgreSQL 16** (Docker)

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 20+ y npm
- Docker y Docker Compose
- Navegador moderno (Chrome, Edge, Firefox, Safari)
- **Dispositivo con biometría configurada**:
  - Windows: Windows Hello
  - macOS: Touch ID o Face ID
  - Linux: Soporte biométrico del sistema

### 1. Clonar el repositorio

```bash
cd LoginSeguro
```

### 2. Configurar Base de Datos

```bash
# Iniciar PostgreSQL con Docker
docker-compose up -d

# Verificar que esté corriendo
docker ps
```

### 3. Configurar Backend

```bash
cd backend

# Las dependencias ya están instaladas
# Si necesitas reinstalar:
# npm install

# Verificar archivo .env (ya está configurado)
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# DATABASE_USER=admin
# DATABASE_PASSWORD=admin123
# DATABASE_NAME=login_seguro
# JWT_SECRET=tu_secreto_jwt_super_seguro_cambiar_en_produccion
# JWT_EXPIRATION=24h
# RP_NAME=Login Seguro
# RP_ID=localhost
# RP_ORIGIN=http://localhost:3000
# PORT=3001
# NODE_ENV=development

# Iniciar servidor backend
npm run start:dev
```

El backend estará corriendo en `http://localhost:3001/api`

### 4. Configurar Frontend

```bash
cd ../frontend

# Las dependencias ya están instaladas
# Si necesitas reinstalar:
# npm install

# Verificar archivo .env.local (ya está configurado)
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
# NEXT_PUBLIC_RP_ID=localhost

# Iniciar servidor frontend
npm run dev
```

El frontend estará corriendo en `http://localhost:3000`

## 📖 Uso

### Registro de Usuario

1. Accede a `http://localhost:3000`
2. Haz clic en "Regístrate aquí"
3. Ingresa tu nombre y email
4. Haz clic en "Registrar con biometría"
5. **Autoriza el uso de biometría** cuando el navegador lo solicite
6. Serás redirigido al login

### Login

1. Ingresa tu email
2. Haz clic en "Iniciar sesión con biometría"
3. **Verifica tu identidad** con biometría (facial, huella, etc.)
4. Serás redirigido al dashboard según tu rol

### Dashboard Admin

- Ver estadísticas de usuarios
- Listar todos los usuarios
- Buscar usuarios por email/nombre
- Crear nuevos usuarios
- Editar usuarios existentes
- Eliminar usuarios

### Dashboard Cliente

- Ver perfil personal
- Editar nombre
- Ver información de seguridad
- Ver fecha de registro

## 🔒 Seguridad

### Principios Implementados

1. **Datos biométricos nunca salen del dispositivo**
   - Solo se almacena la clave pública
   - La clave privada permanece en el autenticador

2. **Protección contra Replay Attacks**
   - Contador incremental en cada autenticación
   - Challenges únicos por sesión

3. **Validación estricta**
   - DTOs con class-validator
   - Sanitización de inputs
   - Prevención de inyecciones SQL

4. **Rate Limiting**
   - 10 intentos por minuto en endpoints de auth

5. **Headers de seguridad**
   - Helmet configurado
   - CORS restrictivo
   - CSP headers

6. **Auditoría**
   - Logs de todos los eventos de seguridad
   - Sin exposición de datos sensibles

### Cumplimiento

- ✅ **GDPR**: No almacenamos datos biométricos
- ✅ **OWASP Top 10**: Mitigaciones implementadas
- ✅ **NIST**: Estándares de autenticación seguidos

## 🏗️ Arquitectura

### Patrones de Diseño Aplicados

1. **Repository Pattern**: Abstracción de acceso a datos
2. **Strategy Pattern**: Diferentes estrategias de autenticación
3. **Factory Pattern**: Creación de credenciales WebAuthn
4. **Guard Pattern**: Control de acceso basado en roles
5. **Singleton Pattern**: Instancia única de API service

### Principios SOLID

- **S**ingle Responsibility: Cada clase tiene una única responsabilidad
- **O**pen/Closed: Extensible sin modificar código existente
- **L**iskov Substitution: Interfaces sustituibles
- **I**nterface Segregation: Interfaces específicas
- **D**ependency Inversion: Dependencias de abstracciones

## 📁 Estructura del Proyecto

```
LoginSeguro/
├── backend/
│   ├── src/
│   │   ├── auth/              # Módulo de autenticación
│   │   │   ├── services/      # WebAuthnService, AuthService
│   │   │   ├── guards/        # JwtAuthGuard, RolesGuard
│   │   │   ├── decorators/    # @Roles, @CurrentUser
│   │   │   └── dto/           # DTOs de validación
│   │   ├── users/             # Módulo de usuarios
│   │   │   ├── entities/      # User, Credential, AuditLog
│   │   │   └── dto/           # CreateUserDto, UpdateUserDto
│   │   ├── common/            # Enums, utilidades
│   │   └── config/            # Configuración TypeORM
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Páginas Next.js
│   │   │   ├── login/         # Página de login
│   │   │   ├── register/      # Página de registro
│   │   │   ├── admin/         # Dashboard admin
│   │   │   └── client/        # Dashboard cliente
│   │   ├── components/        # Componentes reutilizables
│   │   ├── services/          # API y WebAuthn services
│   │   └── store/             # Zustand store
│   └── package.json
└── docker-compose.yml         # PostgreSQL
```

## 🧪 Pruebas

### Pruebas Manuales

1. **Registro exitoso**
   - Verificar que se crea el usuario
   - Verificar que se almacena la credencial pública

2. **Login exitoso**
   - Verificar redirección según rol
   - Verificar token JWT

3. **Control de acceso**
   - Cliente no puede acceder a dashboard admin
   - Admin puede acceder a todo

4. **Edición de perfil**
   - Cliente puede editar su nombre
   - Cliente no puede cambiar su rol

### Pruebas de Seguridad

```bash
# Análisis estático (backend)
cd backend
npm run lint

# Auditoría de dependencias
npm audit
```

## 🐛 Solución de Problemas

### "WebAuthn no está soportado"

- Asegúrate de usar un navegador moderno actualizado
- Verifica que tengas biometría configurada en tu dispositivo
- En desarrollo, usa `localhost` (no `127.0.0.1`)

### "Error de conexión al backend"

- Verifica que el backend esté corriendo en puerto 3001
- Verifica que PostgreSQL esté corriendo
- Revisa los logs del backend

### "Error de base de datos"

```bash
# Reiniciar PostgreSQL
docker-compose down
docker-compose up -d

# Verificar logs
docker-compose logs postgres
```

## 📚 Documentación Adicional

- [WebAuthn Guide](https://webauthn.guide/)
- [FIDO Alliance](https://fidoalliance.org/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## 👥 Roles y Permisos

| Acción | Admin | Cliente |
|--------|-------|---------|
| Ver dashboard propio | ✅ | ✅ |
| Ver lista de usuarios | ✅ | ❌ |
| Crear usuarios | ✅ | ❌ |
| Editar cualquier usuario | ✅ | ❌ |
| Editar perfil propio | ✅ | ✅ (limitado) |
| Eliminar usuarios | ✅ | ❌ |
| Ver auditoría | ✅ | ❌ |

## 📝 Notas de Desarrollo

- El proyecto usa TypeScript en frontend y backend
- Las migraciones de base de datos se ejecutan automáticamente en desarrollo
- Los logs de auditoría se almacenan en la tabla `audit_logs`
- El contador de credenciales previene replay attacks

## 🔄 Próximas Mejoras

- [ ] Soporte para múltiples credenciales por usuario
- [ ] Recuperación de cuenta
- [ ] Notificaciones por email
- [ ] Dashboard de auditoría para admin
- [ ] Exportación de logs
- [ ] Tests automatizados (Jest, Playwright)
- [ ] CI/CD pipeline
- [ ] Despliegue en producción

## 📄 Licencia

MIT

---

**Desarrollado como proyecto académico de seguridad informática**
Corran el script del backend llamado insert-admin.sql para insertar un admin por defecto