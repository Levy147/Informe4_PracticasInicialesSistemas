const request = require('supertest');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('./setup'); // Cargar configuración de test

// Crear una aplicación de prueba
const app = express();
app.use(cors());
app.use(express.json());

// Importar rutas después del setup
const postsRoutes = require('../routes/posts');
app.use('/api/posts', postsRoutes);

// Helper para generar token válido
const generateValidToken = (userId = 1, carnet = '12345', email = 'test@test.com') => {
  return jwt.sign(
    { userId, carnet, email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

describe('Posts Routes', () => {
  beforeEach(() => {
    global.mockPool.execute.mockClear();
  });

  describe('GET /api/posts', () => {
    it('debería obtener todas las publicaciones exitosamente', async () => {
      const mockPosts = [
        {
          id: 1,
          tipo: 'curso',
          mensaje: 'Test post',
          fecha: new Date(),
          usuario_id: 1,
          nombres: 'Juan',
          apellidos: 'Pérez',
          carnet: '12345',
          curso_nombre: 'Matemáticas',
          curso_codigo: 'MAT101',
          total_comentarios: 2
        }
      ];

      const mockCount = [{ total: 1 }];

      global.mockPool.execute
        .mockResolvedValueOnce([mockPosts]) // Consulta principal
        .mockResolvedValueOnce([mockCount]); // Consulta de conteo

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0]).toHaveProperty('id', 1);
      expect(response.body.pagination).toHaveProperty('total', 1);
    });

    it('debería filtrar publicaciones por tipo', async () => {
      global.mockPool.execute
        .mockResolvedValueOnce([[]]) // Sin resultados
        .mockResolvedValueOnce([[{ total: 0 }]]); // Sin conteo

      const response = await request(app)
        .get('/api/posts?tipo=profesor')
        .expect(200);

      expect(response.body.posts).toHaveLength(0);
      
      // Verificar que se llamó con el filtro correcto
      expect(global.mockPool.execute).toHaveBeenCalledWith(
        expect.stringContaining('AND p.tipo = ?'),
        expect.arrayContaining(['profesor'])
      );
    });

    it('debería filtrar publicaciones por búsqueda', async () => {
      global.mockPool.execute
        .mockResolvedValueOnce([[]]) 
        .mockResolvedValueOnce([[{ total: 0 }]]);

      const response = await request(app)
        .get('/api/posts?search=matemáticas')
        .expect(200);

      // Verificar que se incluye el filtro de búsqueda
      expect(global.mockPool.execute).toHaveBeenCalledWith(
        expect.stringContaining('AND (p.mensaje LIKE ? OR c.nombre LIKE ?'),
        expect.arrayContaining(['%matemáticas%', '%matemáticas%'])
      );
    });
  });

  describe('GET /api/posts/:id', () => {
    it('debería obtener una publicación por ID', async () => {
      const mockPost = {
        id: 1,
        tipo: 'curso',
        mensaje: 'Test post',
        fecha: new Date(),
        usuario_id: 1,
        nombres: 'Juan',
        apellidos: 'Pérez',
        carnet: '12345',
        curso_nombre: 'Matemáticas',
        curso_codigo: 'MAT101'
      };

      global.mockPool.execute
        .mockResolvedValueOnce([[mockPost]]);

      const response = await request(app)
        .get('/api/posts/1')
        .expect(200);

      expect(response.body).toHaveProperty('post');
      expect(response.body.post).toHaveProperty('id', 1);
    });

    it('debería retornar 404 si la publicación no existe', async () => {
      global.mockPool.execute
        .mockResolvedValueOnce([[]]); // Sin resultados

      const response = await request(app)
        .get('/api/posts/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'POST_NOT_FOUND');
    });
  });

  describe('POST /api/posts', () => {
    it('debería crear una nueva publicación exitosamente', async () => {
      const token = generateValidToken();
      
      const mockCourse = { id: 1 };
      const mockNewPost = {
        id: 1,
        tipo: 'curso',
        mensaje: 'Nueva publicación',
        fecha: new Date(),
        usuario_id: 1,
        nombres: 'Juan',
        apellidos: 'Pérez',
        carnet: '12345',
        curso_nombre: 'Matemáticas',
        curso_codigo: 'MAT101'
      };

      global.mockPool.execute
        .mockResolvedValueOnce([[mockCourse]]) // Verificar curso existe
        .mockResolvedValueOnce([{ insertId: 1 }]) // Insertar publicación
        .mockResolvedValueOnce([[mockNewPost]]); // Obtener publicación creada

      const postData = {
        tipo: 'curso',
        materia_id: 1,
        mensaje: 'Nueva publicación'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(postData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Publicación creada exitosamente');
      expect(response.body).toHaveProperty('post');
      expect(response.body.post).toHaveProperty('id', 1);
    });

    it('debería fallar sin token de autorización', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('error', 'TOKEN_MISSING');
    });

    it('debería fallar si faltan campos requeridos', async () => {
      const token = generateValidToken();

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ tipo: 'curso' }) // Faltan materia_id y mensaje
        .expect(400);

      expect(response.body).toHaveProperty('error', 'MISSING_FIELDS');
    });

    it('debería fallar con tipo inválido', async () => {
      const token = generateValidToken();

      const postData = {
        tipo: 'invalido',
        materia_id: 1,
        mensaje: 'Test mensaje'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(postData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'INVALID_TYPE');
    });

    it('debería fallar si el curso no existe', async () => {
      const token = generateValidToken();

      global.mockPool.execute
        .mockResolvedValueOnce([[]]); // Curso no existe

      const postData = {
        tipo: 'curso',
        materia_id: 999,
        mensaje: 'Test mensaje'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(postData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'COURSE_NOT_FOUND');
    });
  });

  describe('GET /api/posts/:id/comments', () => {
    it('debería obtener comentarios de una publicación', async () => {
      const mockComments = [
        {
          id: 1,
          mensaje: 'Comentario test',
          fecha: new Date(),
          usuario_id: 1,
          nombres: 'Juan',
          apellidos: 'Pérez',
          carnet: '12345'
        }
      ];

      global.mockPool.execute
        .mockResolvedValueOnce([[{ id: 1 }]]) // Verificar publicación existe
        .mockResolvedValueOnce([mockComments]) // Obtener comentarios
        .mockResolvedValueOnce([[{ total: 1 }]]); // Conteo

      const response = await request(app)
        .get('/api/posts/1/comments')
        .expect(200);

      expect(response.body).toHaveProperty('comments');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.comments).toHaveLength(1);
    });

    it('debería fallar si la publicación no existe', async () => {
      global.mockPool.execute
        .mockResolvedValueOnce([[]]); // Publicación no existe

      const response = await request(app)
        .get('/api/posts/999/comments')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'POST_NOT_FOUND');
    });
  });

  describe('POST /api/posts/:id/comments', () => {
    it('debería crear un comentario exitosamente', async () => {
      const token = generateValidToken();
      
      const mockNewComment = {
        id: 1,
        mensaje: 'Nuevo comentario',
        fecha: new Date(),
        usuario_id: 1,
        nombres: 'Juan',
        apellidos: 'Pérez',
        carnet: '12345'
      };

      global.mockPool.execute
        .mockResolvedValueOnce([[{ id: 1 }]]) // Verificar publicación existe
        .mockResolvedValueOnce([{ insertId: 1 }]) // Insertar comentario
        .mockResolvedValueOnce([[mockNewComment]]); // Obtener comentario creado

      const response = await request(app)
        .post('/api/posts/1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ mensaje: 'Nuevo comentario' })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Comentario creado exitosamente');
      expect(response.body).toHaveProperty('comment');
    });

    it('debería fallar sin mensaje', async () => {
      const token = generateValidToken();

      const response = await request(app)
        .post('/api/posts/1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'MISSING_MESSAGE');
    });
  });
});
