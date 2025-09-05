import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import postsService from '../services/postsService';
import { 
  BookOpen, 
  MessageCircle, 
  Users, 
  TrendingUp,
  Calendar,
  Bell,
  Plus
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalCourses: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Cargar publicaciones recientes
        const postsResult = await postsService.getAllPosts({ limit: 5 });
        if (postsResult.success) {
          setRecentPosts(postsResult.data.posts || []);
          setStats(prevStats => ({
            ...prevStats,
            totalPosts: postsResult.data.total || 0
          }));
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPostTypeColor = (type) => {
    const colors = {
      'pregunta': '#3b82f6',
      'respuesta': '#10b981',
      'discusion': '#f59e0b',
      'anuncio': '#ef4444'
    };
    return colors[type] || '#64748b';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>¡Bienvenido, {user?.nombres}!</h1>
          <p>Aquí tienes un resumen de tu actividad en el sistema educativo</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            <Plus size={18} />
            Nueva Publicación
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff' }}>
            <BookOpen size={24} color="#3b82f6" />
          </div>
          <div className="stat-content">
            <h3>{stats.totalPosts}</h3>
            <p>Publicaciones Totales</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4' }}>
            <MessageCircle size={24} color="#10b981" />
          </div>
          <div className="stat-content">
            <h3>{stats.totalComments}</h3>
            <p>Comentarios</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fefce8' }}>
            <Users size={24} color="#f59e0b" />
          </div>
          <div className="stat-content">
            <h3>{stats.totalCourses}</h3>
            <p>Cursos Activos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fdf2f8' }}>
            <TrendingUp size={24} color="#ec4899" />
          </div>
          <div className="stat-content">
            <h3>85%</h3>
            <p>Participación</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="main-content">
          <div className="section-card">
            <div className="section-header">
              <h2>Publicaciones Recientes</h2>
              <button className="btn btn-outline">Ver Todas</button>
            </div>
            
            {recentPosts.length > 0 ? (
              <div className="posts-list">
                {recentPosts.map((post) => (
                  <div key={post.id} className="post-item">
                    <div className="post-header">
                      <span 
                        className="post-type"
                        style={{ backgroundColor: getPostTypeColor(post.tipo) }}
                      >
                        {post.tipo}
                      </span>
                      <span className="post-date">
                        <Calendar size={14} />
                        {formatDate(post.fecha_creacion)}
                      </span>
                    </div>
                    <h3 className="post-title">{post.mensaje.substring(0, 100)}...</h3>
                    <div className="post-meta">
                      <span className="post-author">
                        Por: {post.usuario_nombres} {post.usuario_apellidos}
                      </span>
                      <span className="post-course">
                        Curso: {post.curso_nombre || 'Sin curso'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <BookOpen size={48} color="#94a3b8" />
                <h3>No hay publicaciones aún</h3>
                <p>Sé el primero en crear una publicación</p>
                <button className="btn btn-primary">
                  <Plus size={18} />
                  Crear Primera Publicación
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar">
          <div className="section-card">
            <div className="section-header">
              <h3>Actividad Reciente</h3>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <Bell size={16} color="#3b82f6" />
                </div>
                <div className="activity-content">
                  <p>Nuevo comentario en tu publicación</p>
                  <span>Hace 2 horas</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <MessageCircle size={16} color="#10b981" />
                </div>
                <div className="activity-content">
                  <p>Respondiste a una pregunta</p>
                  <span>Hace 1 día</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <BookOpen size={16} color="#f59e0b" />
                </div>
                <div className="activity-content">
                  <p>Te uniste a un nuevo curso</p>
                  <span>Hace 3 días</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <h3>Accesos Rápidos</h3>
            </div>
            <div className="quick-actions">
              <button className="quick-action-btn">
                <BookOpen size={20} />
                <span>Mis Cursos</span>
              </button>
              <button className="quick-action-btn">
                <MessageCircle size={20} />
                <span>Mis Publicaciones</span>
              </button>
              <button className="quick-action-btn">
                <Users size={20} />
                <span>Profesores</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
