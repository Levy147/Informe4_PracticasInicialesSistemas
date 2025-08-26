const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middlewares/auth');

// GET /api/posts - Obtener todas las publicaciones
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.id,
        p.tipo,
        p.mensaje,
        p.fecha,
        u.id as usuario_id,
        u.nombres,
        u.apellidos,
        u.carnet,
        c.nombre as curso_nombre,
        c.codigo as curso_codigo
      FROM publicaciones p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN cursos c ON p.materia_id = c.id
      ORDER BY p.fecha DESC
    `);
    
    res.json({ posts: rows });
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/posts/:id - Obtener publicación por ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    
    const [rows] = await pool.execute(`
      SELECT 
        p.id,
        p.tipo,
        p.mensaje,
        p.fecha,
        u.id as usuario_id,
        u.nombres,
        u.apellidos,
        u.carnet,
        c.nombre as curso_nombre,
        c.codigo as curso_codigo
      FROM publicaciones p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN cursos c ON p.materia_id = c.id
      WHERE p.id = ?
    `, [postId]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Publicación no encontrada',
        error: 'POST_NOT_FOUND'
      });
    }
    
    res.json({ post: rows[0] });
  } catch (error) {
    console.error('Error al obtener publicación:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/posts - Crear nueva publicación
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tipo, materia_id, mensaje } = req.body;
    const usuario_id = req.user.userId;
    
    // Validaciones básicas
    if (!tipo || !materia_id || !mensaje) {
      return res.status(400).json({
        message: 'Todos los campos son requeridos',
        error: 'MISSING_FIELDS'
      });
    }
    
    if (!['curso', 'profesor'].includes(tipo)) {
      return res.status(400).json({
        message: 'Tipo debe ser "curso" o "profesor"',
        error: 'INVALID_TYPE'
      });
    }
    
    // Verificar que el curso existe
    const [cursoRows] = await pool.execute(
      'SELECT id FROM cursos WHERE id = ?',
      [materia_id]
    );
    
    if (cursoRows.length === 0) {
      return res.status(400).json({
        message: 'El curso especificado no existe',
        error: 'COURSE_NOT_FOUND'
      });
    }
    
    // Crear la publicación
    const [result] = await pool.execute(
      'INSERT INTO publicaciones (usuario_id, tipo, materia_id, mensaje) VALUES (?, ?, ?, ?)',
      [usuario_id, tipo, materia_id, mensaje]
    );
    
    // Obtener la publicación creada
    const [newPost] = await pool.execute(`
      SELECT 
        p.id,
        p.tipo,
        p.mensaje,
        p.fecha,
        u.id as usuario_id,
        u.nombres,
        u.apellidos,
        u.carnet,
        c.nombre as curso_nombre,
        c.codigo as curso_codigo
      FROM publicaciones p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN cursos c ON p.materia_id = c.id
      WHERE p.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      message: 'Publicación creada exitosamente',
      post: newPost[0]
    });
    
  } catch (error) {
    console.error('Error al crear publicación:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/posts/course/:courseId - Obtener publicaciones por curso
router.get('/course/:courseId', optionalAuth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    
    const [rows] = await pool.execute(`
      SELECT 
        p.id,
        p.tipo,
        p.mensaje,
        p.fecha,
        u.id as usuario_id,
        u.nombres,
        u.apellidos,
        u.carnet,
        c.nombre as curso_nombre,
        c.codigo as curso_codigo
      FROM publicaciones p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN cursos c ON p.materia_id = c.id
      WHERE p.materia_id = ?
      ORDER BY p.fecha DESC
    `, [courseId]);
    
    res.json({ posts: rows });
  } catch (error) {
    console.error('Error al obtener publicaciones por curso:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;
