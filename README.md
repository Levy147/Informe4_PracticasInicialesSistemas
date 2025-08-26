# Sistema Educativo - Backend API

Este es un proyecto web backend para un sistema educativo que permite a los usuarios crear publicaciones, comentarios y gestionar cursos.

## 🚀 Características

- **Autenticación JWT** con registro y login de usuarios
- **Gestión de usuarios** con perfiles y actualizaciones
- **Sistema de publicaciones** sobre cursos y profesores
- **Base de datos MySQL** con estructura optimizada
- **API RESTful** con validaciones y manejo de errores
- **Middleware de autenticación** para rutas protegidas

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- MySQL (versión 5.7 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Levy147/Informe4_PracticasInicialesSistemas.git
   cd "Proyect Web"
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Copiar el archivo de ejemplo
   cp config.env.example .env
   
   # Editar .env con tus configuraciones
   ```

4. **Configurar la base de datos**
   - Crear base de datos MySQL llamada `sistema_educativo`
   - Ejecutar el script SQL: `DataBaseV1.sql`

5. **Iniciar el servidor**
   ```bash
   # Modo desarrollo (con nodemon)
   npm run dev
   
   # Modo producción
   npm start
   ```

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# Servidor
PORT=3000

# Base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=sistema_educativo
DB_PORT=3306

# JWT
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=24h

# Seguridad
BCRYPT_ROUNDS=10
```

## 📚 Estructura del Proyecto

```
├── app.js                 # Archivo principal del servidor
├── config/
│   ├── database.js        # Configuración de base de datos
│   └── config.env.example # Variables de entorno de ejemplo
├── controllers/
│   └── authController.js  # Controlador de autenticación
├── middlewares/
│   └── auth.js           # Middleware de autenticación JWT
├── models/
│   └── User.js           # Modelo de usuario
├── routes/
│   ├── auth.js           # Rutas de autenticación
│   ├── posts.js          # Rutas de publicaciones
│   └── users.js          # Rutas de usuarios
├── DataBaseV1.sql        # Script de base de datos
└── package.json
```

## 🔌 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/profile` - Perfil del usuario autenticado

### Usuarios
- `GET /api/users` - Listar todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `PUT /api/users/:id` - Actualizar usuario

### Publicaciones
- `GET /api/posts` - Listar todas las publicaciones
- `GET /api/posts/:id` - Obtener publicación por ID
- `POST /api/posts` - Crear nueva publicación
- `GET /api/posts/course/:courseId` - Publicaciones por curso

## 🗄️ Base de Datos

El sistema incluye las siguientes tablas:
- `usuarios` - Gestión de usuarios del sistema
- `profesores` - Catálogo de profesores
- `cursos` - Catálogo de cursos disponibles
- `publicaciones` - Posts sobre cursos o profesores
- `comentarios` - Sistema de comentarios
- `cursos_aprobados` - Historial de cursos aprobados

## 🚀 Uso

1. **Registrar un usuario**
   ```bash
   POST /api/auth/register
   {
     "carnet": "2021001",
     "nombres": "Juan Carlos",
     "apellidos": "Pérez González",
     "email": "juan@example.com",
     "password": "123456"
   }
   ```

2. **Iniciar sesión**
   ```bash
   POST /api/auth/login
   {
     "email": "juan@example.com",
     "password": "123456"
   }
   ```

3. **Crear una publicación**
   ```bash
   POST /api/posts
   Authorization: Bearer <token>
   {
     "tipo": "curso",
     "materia_id": 1,
     "mensaje": "¿Alguien puede explicar variables en programación?"
   }
   ```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación JWT para rutas protegidas
- Validación de datos en todos los endpoints
- Sanitización de consultas SQL con parámetros preparados

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.
