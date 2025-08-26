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

  // Recuperación de contraseña
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Validar que se proporcione el email
      if (!email) {
        return res.status(400).json({
          message: 'El email es requerido',
          error: 'MISSING_EMAIL'
        });
      }

      // Buscar usuario por email
      const user = await User.findByEmail(email);
      if (!user) {
        // Por seguridad, no revelar si el email existe o no
        return res.json({
          message: 'Si el email existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña',
          success: true
        });
      }

      // Generar token temporal para recuperación (expira en 1 hora)
      const resetToken = jwt.sign(
        { userId: user.id, email: user.email, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // En un entorno real, aquí enviarías un email con el token
      // Por ahora, simulamos el envío exitoso
      console.log(`Token de recuperación para ${email}: ${resetToken}`);

      res.json({
        message: 'Si el email existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña',
        success: true,
        // En producción, NO incluir el token en la respuesta
        // resetToken: resetToken // Solo para desarrollo
      });

    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Reset de contraseña usando token
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // Validaciones básicas
      if (!token || !newPassword) {
        return res.status(400).json({
          message: 'Token y nueva contraseña son requeridos',
          error: 'MISSING_FIELDS'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message: 'La nueva contraseña debe tener al menos 6 caracteres',
          error: 'PASSWORD_TOO_SHORT'
        });
      }

      // Verificar el token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return res.status(400).json({
          message: 'Token inválido o expirado',
          error: 'INVALID_TOKEN'
        });
      }

      // Verificar que el token sea de tipo password_reset
      if (decoded.type !== 'password_reset') {
        return res.status(400).json({
          message: 'Token inválido para reset de contraseña',
          error: 'INVALID_TOKEN_TYPE'
        });
      }

      // Buscar el usuario
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND'
        });
      }

      // Actualizar la contraseña
      const success = await User.updatePassword(decoded.userId, newPassword);
      
      if (!success) {
        return res.status(500).json({
          message: 'Error al actualizar la contraseña',
          error: 'UPDATE_FAILED'
        });
      }

      res.json({
        message: 'Contraseña actualizada exitosamente',
        success: true
      });

    } catch (error) {
      console.error('Error en reset de contraseña:', error);
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
