const express = require('express');
const router = express.Router();
const PostsController = require('../controllers/postsController');
const { authenticateToken, optionalAuth } = require('../middlewares/auth');

// GET /api/posts - Obtener todas las publicaciones con filtros
router.get('/', optionalAuth, PostsController.getAllPosts);

// GET /api/posts/:id - Obtener publicación por ID
router.get('/:id', optionalAuth, PostsController.getPostById);

// POST /api/posts - Crear nueva publicación
router.post('/', authenticateToken, PostsController.createPost);

// GET /api/posts/:id/comments - Obtener comentarios de una publicación
router.get('/:id/comments', optionalAuth, PostsController.getPostComments);

// POST /api/posts/:id/comments - Crear comentario en una publicación
router.post('/:id/comments', authenticateToken, PostsController.createComment);

// GET /api/posts/course/:courseId - Obtener publicaciones por curso
router.get('/course/:courseId', optionalAuth, PostsController.getPostsByCourse);

module.exports = router;
