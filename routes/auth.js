const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

// POST /api/auth/register - Registro de usuario
router.post('/register', AuthController.register);

// POST /api/auth/login - Login de usuario
router.post('/login', AuthController.login);

// POST /api/auth/forgot-password - Recuperación de contraseña
router.post('/forgot-password', AuthController.forgotPassword);

// POST /api/auth/reset-password - Reset de contraseña usando token
router.post('/reset-password', AuthController.resetPassword);

// GET /api/auth/profile - Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, AuthController.getProfile);

module.exports = router;
