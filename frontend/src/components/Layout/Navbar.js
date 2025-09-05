import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  BookOpen, 
  Users, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <BookOpen size={24} />
          <span>Sistema Educativo</span>
        </Link>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link" onClick={closeMenu}>
                <Home size={18} />
                <span>Inicio</span>
              </Link>
              
              <Link to="/posts" className="navbar-link" onClick={closeMenu}>
                <BookOpen size={18} />
                <span>Publicaciones</span>
              </Link>
              
              <Link to="/courses" className="navbar-link" onClick={closeMenu}>
                <Users size={18} />
                <span>Cursos</span>
              </Link>
              
              <div className="navbar-user">
                <div className="user-info">
                  <User size={18} />
                  <span>{user?.nombres} {user?.apellidos}</span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  <LogOut size={18} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-outline" onClick={closeMenu}>
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMenu}>
                Registrarse
              </Link>
            </div>
          )}
        </div>

        <button className="navbar-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
