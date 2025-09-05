import api from './api';

const postsService = {
  // Obtener todas las publicaciones
  getAllPosts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.materia_id) params.append('materia_id', filters.materia_id);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/posts?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener publicaciones'
      };
    }
  },

  // Obtener publicación por ID
  getPostById: async (id) => {
    try {
      const response = await api.get(`/posts/${id}`);
      return {
        success: true,
        data: response.data.post
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener publicación'
      };
    }
  },

  // Crear nueva publicación
  createPost: async (postData) => {
    try {
      const response = await api.post('/posts', postData);
      return {
        success: true,
        data: response.data.post,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear publicación'
      };
    }
  },

  // Obtener comentarios de una publicación
  getPostComments: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      return {
        success: true,
        data: response.data.comments
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener comentarios'
      };
    }
  },

  // Crear comentario en una publicación
  createComment: async (postId, commentData) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, commentData);
      return {
        success: true,
        data: response.data.comment,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear comentario'
      };
    }
  },

  // Obtener publicaciones por curso
  getPostsByCourse: async (courseId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/posts/course/${courseId}?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener publicaciones del curso'
      };
    }
  }
};

export default postsService;
