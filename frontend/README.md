# Frontend - Sistema Educativo

Frontend desarrollado con React para el Sistema Educativo.

## Características

- **Autenticación completa**: Login, registro, recuperación de contraseña
- **Dashboard interactivo**: Resumen de actividad y estadísticas
- **Interfaz moderna**: Diseño responsive con componentes reutilizables
- **Gestión de estado**: Context API para autenticación
- **Integración API**: Servicios para comunicación con el backend

## Tecnologías Utilizadas

- **React 18**: Framework principal
- **React Router**: Navegación y rutas
- **Axios**: Cliente HTTP para APIs
- **Lucide React**: Iconos modernos
- **CSS3**: Estilos personalizados con variables CSS

## Estructura del Proyecto

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── Layout/
│   │       ├── Navbar.js
│   │       └── Navbar.css
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   ├── Auth.css
│   │   └── Dashboard.css
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── postsService.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## Instalación y Uso

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   - El archivo `.env` debe contener:
   ```
   REACT_APP_API_URL=http://localhost:3000/api
   ```

3. **Iniciar en desarrollo:**
   ```bash
   npm start
   ```
   La aplicación estará disponible en `http://localhost:3001`

4. **Construcción para producción:**
   ```bash
   npm run build
   ```

## Funcionalidades Implementadas

### 🔐 Autenticación
- Login con email y contraseña
- Registro de nuevos usuarios
- Gestión de sesiones con JWT
- Rutas protegidas
- Logout automático en token expirado

### 🏠 Dashboard
- Panel principal con estadísticas
- Publicaciones recientes
- Actividad del usuario
- Accesos rápidos

### 🎨 Diseño
- Interfaz responsive (móvil y desktop)
- Tema moderno con variables CSS
- Componentes reutilizables
- Iconos con Lucide React
- Animaciones y transiciones suaves

### 🔗 Integración API
- Servicio de autenticación completo
- Gestión de publicaciones
- Interceptores para manejo de errores
- Renovación automática de tokens

## Servicios Disponibles

### AuthService
- `login(credentials)`: Iniciar sesión
- `register(userData)`: Registrar usuario
- `logout()`: Cerrar sesión
- `getProfile()`: Obtener perfil
- `isAuthenticated()`: Verificar autenticación

### PostsService
- `getAllPosts(filters)`: Obtener publicaciones
- `getPostById(id)`: Obtener publicación específica
- `createPost(data)`: Crear publicación
- `getPostComments(id)`: Obtener comentarios
- `createComment(id, data)`: Crear comentario

## Componentes Principales

### Navbar
- Navegación principal
- Menú responsive
- Información del usuario
- Logout

### AuthContext
- Gestión global de autenticación
- Estado del usuario
- Funciones de login/logout
- Loading states

## Próximas Funcionalidades

- [ ] Página de publicaciones completa
- [ ] Gestión de cursos
- [ ] Chat en tiempo real
- [ ] Notificaciones
- [ ] Perfil de usuario editable
- [ ] Búsqueda avanzada
- [ ] Modo oscuro

## Configuración del Backend

Asegúrate de que el backend esté ejecutándose en `http://localhost:3000` con las siguientes rutas configuradas:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/profile`
- `GET /api/posts`
- `POST /api/posts`

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request
