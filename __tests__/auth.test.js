const request = require('supertest');
const express = require('express');
const cors = require('cors');
require('./setup'); // Cargar configuración de test

// Crear una aplicación de prueba
const app = express();
app.use(cors());
app.use(express.json());

// Importar rutas después del setup para asegurar que los mocks estén en su lugar
const authRoutes = require('../routes/auth');
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    // Resetear mocks antes de cada test
    global.mockPool.execute.mockClear();
  });

  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      // Mock de las consultas de la base de datos
      global.mockPool.execute
        .mockResolvedValueOnce([[]]) // findByEmail - no existe
        .mockResolvedValueOnce([[]]) // findByCarnet - no existe
        .mockResolvedValueOnce([{ insertId: 1 }]) // create - inserción exitosa
        .mockResolvedValueOnce([[{ id: 1, carnet: '12345', nombres: 'Juan', apellidos: 'Pérez', email: 'juan@test.com', fecha_creacion: new Date() }]]); // findById

      const userData = {
        carnet: '12345',
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Usuario registrado exitosamente');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('carnet', '12345');
    });

    it('debería fallar si faltan campos requeridos', async () => {
      const incompleteData = {
        carnet: '12345',
        nombres: 'Juan'
        // Faltan apellidos, email y password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'MISSING_FIELDS');
    });

    it('debería fallar si la contraseña es muy corta', async () => {
      const userData = {
        carnet: '12345',
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan@test.com',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'PASSWORD_TOO_SHORT');
    });

    it('debería fallar si el email ya existe', async () => {
      // Mock que simula que el email ya existe
      global.mockPool.execute
        .mockResolvedValueOnce([[{ id: 1, email: 'juan@test.com' }]]); // findByEmail - existe

      const userData = {
        carnet: '12345',
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'EMAIL_EXISTS');
    });

    it('debería fallar si el carnet ya existe', async () => {
      // Mock que simula que el carnet ya existe
      global.mockPool.execute
        .mockResolvedValueOnce([[]]) // findByEmail - no existe
        .mockResolvedValueOnce([[{ id: 1, carnet: '12345' }]]); // findByCarnet - existe

      const userData = {
        carnet: '12345',
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'CARNET_EXISTS');
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería autenticar un usuario exitosamente', async () => {
      // Mock del usuario con contraseña hasheada
      const mockUser = {
        id: 1,
        carnet: '12345',
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan@test.com',
        password: '$2a$10$encrypted.password.hash'
      };

      global.mockPool.execute
        .mockResolvedValueOnce([[mockUser]]); // findByEmail

      // Mock de bcrypt para verificar contraseña
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const loginData = {
        email: 'juan@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login exitoso');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('password');

      // Limpiar el mock
      bcrypt.compare.mockRestore();
    });

    it('debería fallar si faltan credenciales', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'juan@test.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'MISSING_CREDENTIALS');
    });

    it('debería fallar si el usuario no existe', async () => {
      global.mockPool.execute
        .mockResolvedValueOnce([[]]); // findByEmail - no existe

      const loginData = {
        email: 'noexiste@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'INVALID_CREDENTIALS');
    });

    it('debería fallar si la contraseña es incorrecta', async () => {
      const mockUser = {
        id: 1,
        email: 'juan@test.com',
        password: '$2a$10$encrypted.password.hash'
      };

      global.mockPool.execute
        .mockResolvedValueOnce([[mockUser]]); // findByEmail

      // Mock de bcrypt para simular contraseña incorrecta
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const loginData = {
        email: 'juan@test.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'INVALID_CREDENTIALS');

      // Limpiar el mock
      bcrypt.compare.mockRestore();
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('debería procesar solicitud de recuperación de contraseña', async () => {
      const mockUser = {
        id: 1,
        email: 'juan@test.com'
      };

      global.mockPool.execute
        .mockResolvedValueOnce([[mockUser]]); // findByEmail

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'juan@test.com' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('instrucciones para recuperar');
    });

    it('debería fallar si no se proporciona email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'MISSING_EMAIL');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('debería fallar sin token de autorización', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'TOKEN_MISSING');
    });

    it('debería fallar con token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'TOKEN_INVALID');
    });
  });
});
