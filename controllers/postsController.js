const { pool } = require('../config/database');

class PostsController {
  // Obtener todas las publicaciones con filtros
  static async getAllPosts(req, res) {
    try {
      const { 
        tipo, 
        curso_id, 
        usuario_id, 
        limit = 20, 
        offset = 0,
        search 
      } = req.query;

      let whereClause = 'WHERE 1=1';
      let params = [];

      // Filtro por tipo
      if (tipo && ['curso', 'profesor'].includes(tipo)) {
        whereClause += ` AND p.tipo = ?`;
        params.push(tipo);
      }

      // Filtro por curso
      if (curso_id) {
        whereClause += ` AND p.materia_id = ?`;
        params.push(parseInt(curso_id));
      }

      // Filtro por usuario
      if (usuario_id) {
        whereClause += ` AND p.usuario_id = ?`;
        params.push(parseInt(usuario_id));
      }

      // Filtro de búsqueda en mensaje
      if (search) {
        whereClause += ` AND (p.mensaje LIKE ? OR c.nombre LIKE ? OR u.nombres LIKE ? OR u.apellidos LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      // Agregar límites y offset
      params.push(parseInt(limit), parseInt(offset));

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
          c.codigo as curso_codigo,
          (SELECT COUNT(*) FROM comentarios WHERE publicacion_id = p.id) as total_comentarios
        FROM publicaciones p
        JOIN usuarios u ON p.usuario_id = u.id
        JOIN cursos c ON p.materia_id = c.id
        ${whereClause}
        ORDER BY p.fecha DESC
        LIMIT ? OFFSET ?
      `, params);
      
      // Obtener total de publicaciones para paginación
      const [countResult] = await pool.execute(`
        SELECT COUNT(*) as total
        FROM publicaciones p
        JOIN usuarios u ON p.usuario_id = u.id
        JOIN cursos c ON p.materia_id = c.id
        ${whereClause.replace('LIMIT ? OFFSET ?', '')}
      `, params.slice(0, -2));
      
      const total = countResult[0].total;
      
      res.json({ 
        posts: rows,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error al obtener publicaciones:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Obtener publicación por ID
  static async getPostById(req, res) {
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
  }

  // Crear nueva publicación
  static async createPost(req, res) {
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
  }

  // Obtener comentarios de una publicación
  static async getPostComments(req, res) {
    try {
      const postId = parseInt(req.params.id);
      const { limit = 50, offset = 0 } = req.query;
      
      // Verificar que la publicación existe
      const [postExists] = await pool.execute(
        'SELECT id FROM publicaciones WHERE id = ?',
        [postId]
      );
      
      if (postExists.length === 0) {
        return res.status(404).json({
          message: 'Publicación no encontrada',
          error: 'POST_NOT_FOUND'
        });
      }
      
      // Obtener comentarios
      const [rows] = await pool.execute(`
        SELECT 
          c.id,
          c.mensaje,
          c.fecha,
          u.id as usuario_id,
          u.nombres,
          u.apellidos,
          u.carnet
        FROM comentarios c
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.publicacion_id = ?
        ORDER BY c.fecha ASC
        LIMIT ? OFFSET ?
      `, [postId, parseInt(limit), parseInt(offset)]);
      
      // Obtener total de comentarios
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM comentarios WHERE publicacion_id = ?',
        [postId]
      );
      
      res.json({
        comments: rows,
        pagination: {
          total: countResult[0].total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
      
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Crear comentario en una publicación
  static async createComment(req, res) {
    try {
      const postId = parseInt(req.params.id);
      const { mensaje } = req.body;
      const usuario_id = req.user.userId;
      
      // Validaciones básicas
      if (!mensaje || mensaje.trim().length === 0) {
        return res.status(400).json({
          message: 'El mensaje del comentario es requerido',
          error: 'MISSING_MESSAGE'
        });
      }
      
      // Verificar que la publicación existe
      const [postExists] = await pool.execute(
        'SELECT id FROM publicaciones WHERE id = ?',
        [postId]
      );
      
      if (postExists.length === 0) {
        return res.status(404).json({
          message: 'Publicación no encontrada',
          error: 'POST_NOT_FOUND'
        });
      }
      
      // Crear el comentario
      const [result] = await pool.execute(
        'INSERT INTO comentarios (publicacion_id, usuario_id, mensaje) VALUES (?, ?, ?)',
        [postId, usuario_id, mensaje.trim()]
      );
      
      // Obtener el comentario creado
      const [newComment] = await pool.execute(`
        SELECT 
          c.id,
          c.mensaje,
          c.fecha,
          u.id as usuario_id,
          u.nombres,
          u.apellidos,
          u.carnet
        FROM comentarios c
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        message: 'Comentario creado exitosamente',
        comment: newComment[0]
      });
      
    } catch (error) {
      console.error('Error al crear comentario:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Obtener publicaciones por curso
  static async getPostsByCourse(req, res) {
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
          c.codigo as curso_codigo,
          (SELECT COUNT(*) FROM comentarios WHERE publicacion_id = p.id) as total_comentarios
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
  }
}

module.exports = PostsController;
