const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middlewares/auth');

// GET /api/users - Obtener todos los usuarios (solo autenticados)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ users });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
        error: 'USER_NOT_FOUND'
      });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    });
  }
});

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { nombres, apellidos, email } = req.body;
    
    // Validar que el usuario solo pueda actualizar su propio perfil
    if (req.user.userId !== userId) {
      return res.status(403).json({
        message: 'No tienes permisos para actualizar este usuario',
        error: 'FORBIDDEN'
      });
    }
    
    // Validaciones básicas
    if (!nombres || !apellidos || !email) {
      return res.status(400).json({
        message: 'Todos los campos son requeridos',
        error: 'MISSING_FIELDS'
      });
    }
    
    const success = await User.update(userId, { nombres, apellidos, email });
    
    if (!success) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
        error: 'USER_NOT_FOUND'
      });
    }
    
    // Obtener usuario actualizado
    const updatedUser = await User.findById(userId);
    
    res.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;
