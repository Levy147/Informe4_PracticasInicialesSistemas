# Sistema Educativo - Backend API

Este es un proyecto **BACKEND** completo para un sistema educativo que permite a los usuarios crear publicaciones, comentarios y gestionar cursos. Desarrollado en Node.js con Express y MySQL.

> ⚠️ **Nota**: Este es únicamente el backend de la aplicación. El frontend se desarrollará por separado.

## 🚀 Características Implementadas

- **🔐 Sistema de Autenticación Completo** con JWT
  - Registro de usuarios con validaciones
  - Login seguro con verificación de contraseñas
  - Recuperación de contraseñas con tokens temporales
  - Middleware de autenticación para rutas protegidas

- **👤 Gestión de Usuarios**
  - Perfiles de usuario completos
  - Actualización de información personal
  - Listado y búsqueda de usuarios

- **📝 Sistema de Publicaciones Avanzado**
  - Crear publicaciones sobre cursos o profesores
  - Filtros múltiples (tipo, curso, usuario, búsqueda)
  - Paginación completa con metadatos
  - Conteo de comentarios por publicación

- **💬 Sistema de Comentarios**
  - Comentarios en publicaciones
  - Paginación de comentarios
  - Información completa del autor

- **🗄️ Base de Datos MySQL Optimizada**
  - Estructura relacional bien diseñada
  - Índices para consultas rápidas
  - Datos reales de cursos y profesores cargados desde CSV

- **🧪 Sistema de Testing Completo**
  - 50+ tests automatizados con Jest
  - Cobertura superior al 60% del código
  - Tests unitarios y de integración
  - Mocking completo de base de datos

## 📋 Requisitos Previos

- **Node.js** (versión 14 o superior)
- **MySQL** (versión 5.7 o superior)
- **npm** o yarn

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Levy147/Informe4_PracticasInicialesSistemas.git
cd "Proyect Web"
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Crear archivo .env con la configuración necesaria
```

### 4. Configurar la base de datos
1. Crear base de datos MySQL llamada `sistema_educativo`
2. Ejecutar el script SQL completo: `DataBaseV1.sql`
3. **Ver vista previa de los datos del CSV** (opcional):
   ```bash
   npm run preview-csv
   ```
4. **Cargar los datos reales** desde el archivo CSV:
   ```bash
   npm run load-real-csv
   ```

### 5. Iniciar el servidor
```bash
# Modo desarrollo (recomendado)
npm run dev

# Modo producción
npm start
```

**✅ Servidor disponible en:** `http://localhost:3000`

## ⚙️ Variables de Entorno

Crear archivo `.env` con:

```env
# Configuración del servidor
PORT=3000

# Configuración de la base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=sistema_educativo
DB_PORT=3306

# Configuración JWT
JWT_SECRET=tu_clave_secreta_super_segura_cambiar_en_produccion
JWT_EXPIRES_IN=24h

# Configuración de seguridad
BCRYPT_ROUNDS=10
```

## 📚 Arquitectura del Proyecto

```
├── app.js                    # 🚀 Servidor principal Express
├── config/
│   ├── database.js           # 🔗 Conexión MySQL con pool
│   └── config.env.example    # 📋 Plantilla de variables de entorno
├── controllers/
│   ├── authController.js     # 🔐 Lógica de autenticación
│   └── postsController.js    # 📝 Lógica de publicaciones
├── middlewares/
│   └── auth.js              # 🛡️ Middleware JWT
├── models/
│   └── User.js              # 👤 Modelo de usuario
├── routes/
│   ├── auth.js              # 🛣️ Rutas de autenticación
│   ├── posts.js             # 🛣️ Rutas de publicaciones
│   └── users.js             # 🛣️ Rutas de usuarios
├── __tests__/               # 🧪 Tests automatizados
│   ├── setup.js             # Configuración global
│   ├── auth.test.js         # Tests de autenticación
│   ├── posts.test.js        # Tests de publicaciones
│   ├── user.model.test.js   # Tests del modelo User
│   └── auth.middleware.test.js # Tests del middleware
├── scripts/                 # 📜 Scripts de utilidad
│   ├── loadRealDataFromCSV.js # Carga de datos reales desde CSV
│   └── previewCSVData.js    # Vista previa de datos del CSV
├── DataBaseV1.sql           # 🗄️ Script completo de BD
├── encoded-profesores_cursos.csv # 📊 Datos reales de cursos y profesores
├── package.json             # 📦 Dependencias y scripts
└── README.md               # 📖 Documentación
```

## 🔌 API Endpoints Completos

### 🔐 **Autenticación** (`/api/auth`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registro de usuario | ❌ |
| POST | `/login` | Inicio de sesión | ❌ |
| POST | `/forgot-password` | Recuperación de contraseña | ❌ |
| POST | `/reset-password` | Cambiar contraseña con token | ❌ |
| GET | `/profile` | Perfil del usuario autenticado | ✅ |

### 👤 **Usuarios** (`/api/users`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar todos los usuarios | ✅ |
| GET | `/:id` | Obtener usuario por ID | ✅ |
| PUT | `/:id` | Actualizar usuario | ✅ |

### 📝 **Publicaciones** (`/api/posts`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar publicaciones con filtros | ❌ |
| GET | `/:id` | Obtener publicación por ID | ❌ |
| POST | `/` | Crear nueva publicación | ✅ |
| GET | `/:id/comments` | Obtener comentarios | ❌ |
| POST | `/:id/comments` | Crear comentario | ✅ |
| GET | `/course/:courseId` | Publicaciones por curso | ❌ |

## 📊 Filtros y Paginación

### **Filtros en GET /api/posts**
```bash
GET /api/posts?tipo=curso&curso_id=1&search=programacion&limit=10&offset=0
```

**Parámetros disponibles:**
- `tipo` - Filtrar por tipo (`curso` o `profesor`)
- `curso_id` - Filtrar por curso específico
- `usuario_id` - Filtrar por usuario específico
- `search` - Búsqueda en mensaje y nombres
- `limit` - Resultados por página (default: 20)
- `offset` - Desplazamiento para paginación (default: 0)

**Respuesta con paginación:**
```json
{
  "posts": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "pages": 8
  }
}
```

## 🧪 Sistema de Testing

### ✅ Tests Implementados

1. **Tests de Autenticación** (`auth.test.js`)
   - Registro, login, recuperación de contraseña
   - Validación de tokens JWT

2. **Tests de Publicaciones** (`posts.test.js`)
   - CRUD completo de publicaciones
   - Filtros, búsquedas y comentarios

3. **Tests del Modelo User** (`user.model.test.js`)
   - Todas las operaciones del modelo
   - Validación de datos y contraseñas

4. **Tests del Middleware** (`auth.middleware.test.js`)
   - Validación de autenticación
   - Manejo de errores

### 🚀 Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (se re-ejecutan automáticamente)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

### 📊 Cobertura de Código

```
File                 | % Stmts | % Branch | % Funcs | % Lines
---------------------|---------|----------|---------|--------
Middlewares          |    100% |     100% |    100% |    100%
Routes (auth/posts)  |    100% |     100% |    100% |    100%
User Model           |   82.5% |    83.3% |    100% |   82.5%
Controllers          |  ~64-74%|   73-91% |   72-83%|  ~64-74%
```

## 🗄️ Base de Datos

### **Tablas Principales:**
- **`usuarios`** - Gestión de estudiantes (carnet, nombres, email, password)
- **`publicaciones`** - Posts sobre cursos/profesores con tipos y mensajes
- **`comentarios`** - Sistema de comentarios en publicaciones
- **`cursos`** - Catálogo de cursos cargado desde CSV
- **`profesores`** - Catálogo de profesores cargado desde CSV
- **`cursos_aprobados`** - Historial académico de estudiantes

### **Datos Reales Incluidos:**
- ✅ **90 cursos** reales del área de sistemas cargados desde `encoded-profesores_cursos.csv`
- ✅ **49 profesores únicos** con nombres y especialidades reales
- ✅ **Usuarios** de ejemplo para pruebas  
- ✅ **Publicaciones** de ejemplo con interacciones
- ✅ **Códigos de curso** generados automáticamente (PROG, BD, ARQ, etc.)

## 📋 Scripts Disponibles

```bash
# Desarrollo
npm run dev                  # Servidor en modo desarrollo
npm start                   # Servidor en modo producción

# Base de datos  
npm run preview-csv         # Vista previa de datos del CSV sin cargar
npm run load-real-csv       # Cargar datos reales desde encoded-profesores_cursos.csv

# Testing
npm test                    # Ejecutar todos los tests
npm run test:watch         # Tests en modo watch
npm run test:coverage      # Tests con reporte de cobertura

# Utilidades
# nodemon se instala automáticamente como dependencia de desarrollo
```

## 🔒 Seguridad Implementada

- **🔐 Autenticación JWT** con tokens seguros
- **🛡️ Contraseñas hasheadas** con bcrypt (10 rounds)
- **✅ Validación de datos** en todos los endpoints
- **🔍 Sanitización SQL** con parámetros preparados
- **⏰ Tokens de recuperación** con expiración (1 hora)
- **🚫 Protección de rutas** sensibles con middleware

## 📋 Ejemplos de Uso

### **1. Registro de Usuario**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "carnet": "2024001",
  "nombres": "Ana María",
  "apellidos": "González López",
  "email": "ana.gonzalez@estudiante.edu",
  "password": "segura123"
}
```

### **2. Inicio de Sesión**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "ana.gonzalez@estudiante.edu",
  "password": "segura123"
}
```

### **3. Crear Publicación**
```bash
POST /api/posts
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "tipo": "curso",
  "materia_id": 1,
  "mensaje": "¿Alguien puede explicar el concepto de herencia en POO?"
}
```

### **4. Agregar Comentario**
```bash
POST /api/posts/1/comments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "mensaje": "La herencia permite que una clase hija use métodos de la clase padre"
}
```

### **5. Buscar Publicaciones**
```bash
GET /api/posts?search=programacion&tipo=curso&limit=5
```

## 🔧 Desarrollo y Testing

```bash
# Instalar nodemon para desarrollo
npm install -g nodemon

# Ejecutar en modo desarrollo
npm run dev

# Verificar conexión
curl http://localhost:3000/
```

## 🛠️ Dependencias Principales

```json
{
  "express": "Framework web principal",
  "mysql2": "Conector MySQL con promesas",
  "bcryptjs": "Hash de contraseñas",
  "jsonwebtoken": "Autenticación JWT",
  "cors": "Habilitación de CORS",
  "dotenv": "Variables de entorno",
  "jest": "Framework de testing",
  "supertest": "Testing de APIs HTTP"
}
```

## 🚀 Siguiente Paso: Frontend

Este backend está completamente funcional y listo para conectar con un frontend desarrollado en:
- **React.js** + axios para requests
- **Vue.js** + fetch API
- **Angular** + HttpClient
- **O cualquier framework** que consuma APIs REST

## 🆘 Solución de Problemas

### Error: "Cannot find module"
```bash
npm install  # Reinstalar dependencias
```

### Tests fallan por timeout
Incrementar timeout en Jest:
```javascript
jest.setTimeout(10000);
```

### Problemas con la base de datos
1. Verificar que MySQL esté ejecutándose
2. Verificar credenciales en archivo `.env`
3. Ejecutar script de base de datos: `DataBaseV1.sql`

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo LICENSE para detalles.

## 👨‍💻 Autor

**Levy147** - Actividad No.4  
🔗 [GitHub Repository](https://github.com/Levy147/Informe4_PracticasInicialesSistemas)

---

> **📌 Resumen:** Backend completo con autenticación JWT, sistema de publicaciones, comentarios, filtros avanzados, base de datos MySQL optimizada con datos reales, y sistema de testing robusto. Listo para integración con frontend.