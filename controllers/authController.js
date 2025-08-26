const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
  // Registro de usuario
  static async register(req, res) {
    try {
      const { carnet, nombres, apellidos, email, password } = req.body;

      // Validaciones básicas
      if (!carnet || !nombres || !apellidos || !email || !password) {
        return res.status(400).json({
          message: 'Todos los campos son requeridos',
          error: 'MISSING_FIELDS'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message: 'La contraseña debe tener al menos 6 caracteres',
          error: 'PASSWORD_TOO_SHORT'
        });
      }

      // Verificar si el email ya existe
      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({
          message: 'El email ya está registrado',
          error: 'EMAIL_EXISTS'
        });
      }

      // Verificar si el carnet ya existe
      const existingUserByCarnet = await User.findByCarnet(carnet);
      if (existingUserByCarnet) {
        return res.status(400).json({
          message: 'El carnet ya está registrado',
          error: 'CARNET_EXISTS'
        });
      }

      // Crear el usuario
      const userId = await User.create({
        carnet,
        nombres,
        apellidos,
        email,
        password
      });

      // Generar token JWT
      const token = jwt.sign(
        { userId, carnet, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Obtener datos del usuario (sin contraseña)
      const user = await User.findById(userId);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user,
        token
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Login de usuario
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validaciones básicas
      if (!email || !password) {
        return res.status(400).json({
          message: 'Email y contraseña son requeridos',
          error: 'MISSING_CREDENTIALS'
        });
      }

      // Buscar usuario por email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          message: 'Credenciales inválidas',
          error: 'INVALID_CREDENTIALS'
        });
      }

      // Verificar contraseña
      const isValidPassword = await User.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          message: 'Credenciales inválidas',
          error: 'INVALID_CREDENTIALS'
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { userId: user.id, carnet: user.carnet, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Enviar respuesta (sin contraseña)
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Login exitoso',
        user: userWithoutPassword,
        token
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Obtener perfil del usuario autenticado
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND'
        });
      }

      res.json({
        user
      });

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }
}

module.exports = AuthController;
