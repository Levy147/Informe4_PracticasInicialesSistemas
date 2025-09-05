import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './App.css';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente para rutas públicas (solo accesibles si NO está autenticado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Página de inicio
const Home = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-hero">
          <h1>Sistema Educativo</h1>
          <p>
            Plataforma integral para estudiantes y profesores. 
            Conecta, aprende y comparte conocimiento de manera colaborativa.
          </p>
          <div className="home-actions">
            <a href="/register" className="btn btn-primary">
              Comenzar Ahora
            </a>
            <a href="/login" className="btn btn-outline">
              Iniciar Sesión
            </a>
          </div>
        </div>
        
        <div className="home-features">
          <div className="feature-card">
            <h3>📚 Cursos Organizados</h3>
            <p>Accede a todos tus cursos de manera organizada y estructurada</p>
          </div>
          <div className="feature-card">
            <h3>💬 Colaboración</h3>
            <p>Participa en discusiones y colabora con compañeros y profesores</p>
          </div>
          <div className="feature-card">
            <h3>📝 Publicaciones</h3>
            <p>Comparte preguntas, respuestas y contenido educativo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />

              {/* Rutas protegidas */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Ruta por defecto - redirigir según autenticación */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
