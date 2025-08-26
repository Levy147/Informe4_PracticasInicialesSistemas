const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

// POST /api/auth/register - Registro de usuario
router.post('/register', AuthController.register);

// POST /api/auth/login - Login de usuario
router.post('/login', AuthController.login);

// GET /api/auth/profile - Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, AuthController.getProfile);

module.exports = router;
