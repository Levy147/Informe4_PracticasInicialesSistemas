# 🧪 Guía Completa de Testing del Proyecto

## 📋 Pasos para Probar el Proyecto Completo

### 1. 🛠️ Configuración Inicial

#### Paso 1: Configurar Variables de Entorno
```bash
# Crear archivo .env basado en el ejemplo
cp config.env.example .env
```

Editar `.env` con tus datos reales:
```env
# Configuración del servidor
PORT=3000

# Configuración de la base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql_real
DB_NAME=sistema_educativo
DB_PORT=3306

# Configuración JWT
JWT_SECRET=mi_clave_super_secreta_2024
JWT_EXPIRES_IN=24h

# Configuración de seguridad
BCRYPT_ROUNDS=10
```

#### Paso 2: Configurar Base de Datos
```bash
# 1. Crear la base de datos en MySQL
mysql -u root -p
CREATE DATABASE sistema_educativo;
USE sistema_educativo;
SOURCE DataBaseV1.sql;
EXIT;

# 2. Ver vista previa de los datos del CSV
npm run preview-csv

# 3. Cargar los datos reales del CSV
npm run load-real-csv
```

#### Paso 3: Iniciar el Servidor
```bash
# Instalar dependencias (si no se ha hecho)
npm install

# Iniciar en modo desarrollo
npm run dev
```

### 2. 🧪 Testing Manual con cURL

#### A) Verificar que el servidor funciona
```bash
curl http://localhost:3000/
# Respuesta esperada: {"message": "Servidor funcionando correctamente"}
```

#### B) Registrar un nuevo usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "carnet": "202400001",
    "nombres": "Juan Carlos",
    "apellidos": "Pérez López",
    "email": "juan.perez@estudiante.edu.gt",
    "password": "mipassword123"
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 4,
    "carnet": "202400001",
    "nombres": "Juan Carlos",
    "apellidos": "Pérez López",
    "email": "juan.perez@estudiante.edu.gt"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### C) Hacer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@estudiante.edu.gt",
    "password": "mipassword123"
  }'
```

**Guarda el token de la respuesta para usarlo en las siguientes pruebas.**

#### D) Ver todos los cursos
```bash
curl http://localhost:3000/api/posts
```

#### E) Ver cursos con filtros
```bash
# Buscar cursos de programación
curl "http://localhost:3000/api/posts?search=programacion&limit=5"

# Filtrar por tipo de curso
curl "http://localhost:3000/api/posts?tipo=curso&limit=10"
```

#### F) Crear una publicación (requiere autenticación)
```bash
# Reemplaza TOKEN_AQUI con el token que obtuviste del login
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{
    "tipo": "curso",
    "materia_id": 1,
    "mensaje": "¿Alguien tiene material adicional sobre este curso? Me cuesta entender algunos conceptos."
  }'
```

#### G) Ver tu perfil (requiere autenticación)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN_AQUI"
```

#### H) Agregar un comentario a una publicación
```bash
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{
    "mensaje": "Yo tengo algunos libros que te pueden ayudar. Te paso la info por privado."
  }'
```

### 3. 🔧 Testing con Postman

#### Importar Colecciones
1. Abrir Postman
2. Importar `postman/Sistema_Educativo_Backend.postman_collection.json`
3. Importar `postman/Desarrollo.postman_environment.json`
4. Seleccionar el environment "Desarrollo"

#### Secuencia de Pruebas en Postman
1. **Auth → Register** - Registrar usuario
2. **Auth → Login** - Hacer login (se guarda el token automáticamente)
3. **Posts → Get All Posts** - Ver todas las publicaciones
4. **Posts → Create Post** - Crear una publicación
5. **Posts → Get Post Comments** - Ver comentarios
6. **Posts → Create Comment** - Agregar comentario
7. **Users → Get Profile** - Ver tu perfil

### 4. 🧪 Testing Automatizado

#### Ejecutar Tests
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests en modo watch (se re-ejecutan automáticamente)
npm run test:watch
```

### 5. 🗄️ Verificar Datos en la Base de Datos

#### Conectarse a MySQL y verificar datos
```sql
-- Conectarse a la base de datos
mysql -u root -p
USE sistema_educativo;

-- Ver todos los cursos cargados
SELECT * FROM cursos LIMIT 10;

-- Ver todos los profesores
SELECT * FROM profesores LIMIT 10;

-- Ver usuarios registrados
SELECT id, carnet, nombres, apellidos, email, fecha_creacion FROM usuarios;

-- Ver publicaciones
SELECT p.*, u.nombres, u.apellidos, c.nombre as curso_nombre 
FROM publicaciones p 
JOIN usuarios u ON p.usuario_id = u.id 
JOIN cursos c ON p.materia_id = c.id;

-- Ver comentarios
SELECT c.*, u.nombres, u.apellidos 
FROM comentarios c 
JOIN usuarios u ON c.usuario_id = u.id;
```

### 6. 📋 Casos de Prueba Específicos

#### A) Probar Validaciones
```bash
# Registrar usuario con datos incompletos (debe fallar)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"carnet": "123", "nombres": "Juan"}'

# Login con credenciales incorrectas (debe fallar)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "noexiste@test.com", "password": "wrong"}'
```

#### B) Probar Autenticación
```bash
# Intentar crear publicación sin token (debe fallar)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"tipo": "curso", "materia_id": 1, "mensaje": "test"}'

# Usar token inválido (debe fallar)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer token_invalido"
```

#### C) Probar Filtros y Búsquedas
```bash
# Buscar cursos específicos
curl "http://localhost:3000/api/posts?search=programacion"
curl "http://localhost:3000/api/posts?search=base+datos"
curl "http://localhost:3000/api/posts?search=sistemas"

# Probar paginación
curl "http://localhost:3000/api/posts?limit=5&offset=0"
curl "http://localhost:3000/api/posts?limit=5&offset=5"
```

### 7. 🔍 Monitoreo y Debugging

#### Ver logs del servidor
```bash
# El servidor muestra logs en tiempo real cuando está en modo dev
npm run dev
```

#### Verificar conexión a la base de datos
```bash
# Si hay problemas de conexión, verificar:
# 1. MySQL está ejecutándose
# 2. Credenciales en .env son correctas
# 3. Base de datos existe
```

### 8. 📊 Resultados Esperados

#### Después de cargar los datos del CSV deberías tener:
- ✅ **90 cursos** del área de sistemas
- ✅ **49 profesores únicos**
- ✅ **3 usuarios de ejemplo** más los que registres
- ✅ **Algunas publicaciones de ejemplo**

#### Los tests automatizados deberían mostrar:
- ✅ **50+ tests pasando**
- ✅ **Cobertura > 60%** en la mayoría de archivos
- ✅ **0 errores** en la ejecución

### 9. 🚨 Solución de Problemas Comunes

#### Error: "ECONNREFUSED"
```bash
# Verificar que MySQL esté ejecutándose
# Windows: services.msc → MySQL
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql
```

#### Error: "Access denied for user"
```bash
# Verificar credenciales en .env
# Crear usuario MySQL si es necesario:
# mysql -u root -p
# CREATE USER 'tu_usuario'@'localhost' IDENTIFIED BY 'tu_password';
# GRANT ALL PRIVILEGES ON sistema_educativo.* TO 'tu_usuario'@'localhost';
```

#### Error: "Database does not exist"
```bash
# Crear la base de datos:
# mysql -u root -p
# CREATE DATABASE sistema_educativo;
```

### 10. ✅ Checklist de Testing Completo

- [ ] ✅ Servidor inicia sin errores
- [ ] ✅ Base de datos conecta correctamente
- [ ] ✅ Datos del CSV se cargan (90 cursos, 49 profesores)
- [ ] ✅ Registro de usuario funciona
- [ ] ✅ Login funciona y devuelve token
- [ ] ✅ Autenticación JWT funciona
- [ ] ✅ Crear publicaciones funciona
- [ ] ✅ Ver publicaciones funciona
- [ ] ✅ Filtros y búsquedas funcionan
- [ ] ✅ Comentarios funcionan
- [ ] ✅ Tests automatizados pasan
- [ ] ✅ Validaciones funcionan correctamente

---

## 🎉 ¡Tu proyecto está completamente funcional!

Con esta guía puedes probar todas las funcionalidades del backend de forma exhaustiva. El proyecto incluye autenticación segura, gestión de publicaciones, comentarios, filtros avanzados y datos reales cargados desde CSV.
