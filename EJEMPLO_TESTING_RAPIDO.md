# ⚡ Ejemplo de Testing Rápido

## 🚀 Prueba en 5 Minutos

### Paso 1: Configurar .env
```bash
# Crear archivo .env
cp config.env.example .env
```

Editar `.env` con tus datos:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=sistema_educativo
DB_PORT=3306
JWT_SECRET=mi_clave_secreta_123
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
```

### Paso 2: Configurar Base de Datos
```sql
-- En MySQL
CREATE DATABASE sistema_educativo;
USE sistema_educativo;
SOURCE DataBaseV1.sql;
```

### Paso 3: Cargar Datos y Verificar
```bash
# Cargar datos del CSV
npm run load-real-csv

# Verificar que se cargaron
npm run check-db

# Iniciar servidor
npm run dev
```

### Paso 4: Probar APIs con cURL

#### A) Verificar servidor
```bash
curl http://localhost:3000/
```

#### B) Registrar usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "carnet": "202400999",
    "nombres": "Test",
    "apellidos": "Usuario",
    "email": "test@estudiante.edu.gt",
    "password": "password123"
  }'
```

#### C) Hacer login y guardar token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@estudiante.edu.gt",
    "password": "password123"
  }'
```

**💡 Guarda el token de la respuesta**

#### D) Ver cursos disponibles
```bash
curl "http://localhost:3000/api/posts?limit=5"
```

#### E) Buscar cursos de programación
```bash
curl "http://localhost:3000/api/posts?search=programacion&limit=3"
```

#### F) Crear una publicación (reemplaza TOKEN_AQUI)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{
    "tipo": "curso",
    "materia_id": 1,
    "mensaje": "¿Alguien tiene el material de este curso?"
  }'
```

#### G) Ver tu perfil
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN_AQUI"
```

### Paso 5: Ejecutar Tests Automatizados
```bash
npm test
```

## 🎯 Resultados Esperados

1. **Base de datos:** ~90 cursos, ~49 profesores
2. **Registro:** Usuario creado con token JWT
3. **Login:** Token válido devuelto
4. **APIs:** Todas las respuestas con status 200/201
5. **Tests:** 50+ tests pasando

## 🔍 Verificaciones Rápidas

```bash
# Ver estado de la base de datos
npm run check-db

# Ver datos del CSV sin cargar
npm run preview-csv

# Ejecutar tests con cobertura
npm run test:coverage
```

## 📱 URLs de Prueba

- Servidor: http://localhost:3000/
- Cursos: http://localhost:3000/api/posts
- Buscar: http://localhost:3000/api/posts?search=programacion

## 🚨 Si algo falla:

1. **Error de conexión:** Verificar MySQL y .env
2. **No hay datos:** Ejecutar `npm run load-real-csv`
3. **Token inválido:** Hacer login nuevamente
4. **Tests fallan:** Ejecutar `npm install`

¡En 5 minutos tendrás todo funcionando! 🎉
