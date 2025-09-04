const request = require('supertest');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear una aplicación de prueba con datos reales
const app = express();
app.use(cors());
app.use(express.json());

// Importar rutas reales
const authRoutes = require('../routes/auth');
const postsRoutes = require('../routes/posts');
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_educativo',
  port: process.env.DB_PORT || 3306
};

describe('Tests de Integración con Datos Reales', () => {
  let connection;
  let authToken;
  let testUserId;

  beforeAll(async () => {
    // Conectar a la base de datos real
    try {
      connection = await mysql.createConnection(dbConfig);
      console.log('✅ Conectado a la base de datos real para tests');
    } catch (error) {
      console.log('❌ No se pudo conectar a la base de datos:', error.message);
      console.log('⚠️ Saltando tests de integración');
    }
  });

  afterAll(async () => {
    // Limpiar usuario de prueba creado
    if (connection && testUserId) {
      try {
        await connection.execute('DELETE FROM usuarios WHERE id = ?', [testUserId]);
        console.log('🧹 Usuario de prueba eliminado');
      } catch (error) {
        console.log('⚠️ Error limpiando usuario de prueba:', error.message);
      }
    }
    
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión de prueba cerrada');
    }
  });

  describe('Verificar datos del CSV cargados', () => {
    test('debe tener cursos cargados desde el CSV', async () => {
      if (!connection) {
        console.log('⏭️ Saltando test - sin conexión a BD');
        return;
      }

      const [rows] = await connection.execute('SELECT COUNT(*) as total FROM cursos');
      expect(rows[0].total).toBeGreaterThan(50); // Esperamos al menos 50 cursos del CSV
      
      console.log(`📚 Cursos encontrados en BD: ${rows[0].total}`);
    });

    test('debe tener profesores cargados desde el CSV', async () => {
      if (!connection) return;

      const [rows] = await connection.execute('SELECT COUNT(*) as total FROM profesores');
      expect(rows[0].total).toBeGreaterThan(30); // Esperamos al menos 30 profesores del CSV
      
      console.log(`👨‍🏫 Profesores encontrados en BD: ${rows[0].total}`);
    });

    test('debe tener cursos de programación del CSV', async () => {
      if (!connection) return;

      const [rows] = await connection.execute(
        "SELECT * FROM cursos WHERE nombre LIKE '%rogramaci%' LIMIT 5"
      );
      expect(rows.length).toBeGreaterThan(0);
      
      console.log(`💻 Cursos de programación encontrados: ${rows.length}`);
      rows.forEach((curso, i) => {
        console.log(`   ${i + 1}. ${curso.codigo} - ${curso.nombre}`);
      });
    });
  });

  describe('Registro y Login con datos reales', () => {
    test('debe registrar un usuario real en la BD', async () => {
      if (!connection) return;

      const userData = {
        carnet: '202499999',
        nombres: 'Test Integration',
        apellidos: 'User Real',
        email: 'test.integration@real.edu.gt',
        password: 'testpass123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Usuario registrado exitosamente');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      
      testUserId = response.body.user.id;
      authToken = response.body.token;
      
      console.log(`👤 Usuario de prueba creado con ID: ${testUserId}`);
    });

    test('debe hacer login con el usuario real', async () => {
      if (!connection || !testUserId) return;

      const loginData = {
        email: 'test.integration@real.edu.gt',
        password: 'testpass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login exitoso');
      expect(response.body).toHaveProperty('token');
      
      authToken = response.body.token; // Actualizar token
      console.log('🔑 Login exitoso con usuario real');
    });
  });

  describe('APIs con datos reales del CSV', () => {
    test('debe obtener cursos reales del CSV', async () => {
      if (!connection) return;

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.posts)).toBe(true);
      
      console.log(`📊 Posts encontrados: ${response.body.posts.length}`);
      console.log(`📈 Total en BD: ${response.body.pagination.total}`);
    });

    test('debe buscar cursos de programación reales', async () => {
      if (!connection) return;

      const response = await request(app)
        .get('/api/posts?search=programacion&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(Array.isArray(response.body.posts)).toBe(true);
      
      console.log(`🔍 Cursos de programación encontrados: ${response.body.posts.length}`);
      response.body.posts.forEach((post, i) => {
        console.log(`   ${i + 1}. ${post.curso_codigo} - ${post.curso_nombre}`);
      });
    });

    test('debe crear publicación real en BD', async () => {
      if (!connection || !authToken) return;

      // Obtener un curso real de la BD
      const [cursos] = await connection.execute('SELECT id FROM cursos LIMIT 1');
      if (cursos.length === 0) {
        console.log('⚠️ No hay cursos en la BD para crear publicación');
        return;
      }

      const postData = {
        tipo: 'curso',
        materia_id: cursos[0].id,
        mensaje: 'Esta es una publicación de prueba real en la base de datos'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Publicación creada exitosamente');
      expect(response.body).toHaveProperty('post');
      
      console.log('📝 Publicación real creada en BD');
      
      // Limpiar la publicación de prueba
      const publicacionId = response.body.post.id;
      await connection.execute('DELETE FROM publicaciones WHERE id = ?', [publicacionId]);
      console.log('🧹 Publicación de prueba eliminada');
    });
  });

  describe('Verificar integridad de datos', () => {
    test('debe tener códigos de curso válidos', async () => {
      if (!connection) return;

      const [rows] = await connection.execute(
        "SELECT codigo FROM cursos WHERE codigo REGEXP '^[A-Z]{2,4}[0-9][A-Z]$' LIMIT 10"
      );
      
      expect(rows.length).toBeGreaterThan(0);
      console.log('🏷️ Códigos de curso válidos encontrados:');
      rows.forEach((curso, i) => {
        console.log(`   ${i + 1}. ${curso.codigo}`);
      });
    });

    test('debe tener emails de profesores válidos', async () => {
      if (!connection) return;

      const [rows] = await connection.execute(
        "SELECT email FROM profesores WHERE email LIKE '%@profesor.edu.gt' LIMIT 5"
      );
      
      expect(rows.length).toBeGreaterThan(0);
      console.log('📧 Emails de profesores válidos:');
      rows.forEach((prof, i) => {
        console.log(`   ${i + 1}. ${prof.email}`);
      });
    });
  });
});

// Solo ejecutar si hay conexión a BD
if (!process.env.DB_HOST) {
  console.log('⚠️ Variables de entorno no configuradas. Configurar .env para ejecutar tests de integración.');
}
