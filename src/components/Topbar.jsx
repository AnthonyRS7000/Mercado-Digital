import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignOutAlt, faBars, faCog } from '@fortawesome/free-solid-svg-icons';
import '../styles/css/Topbar.css';

const Topbar = ({ toggleSidebar }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('Usuario');
  const [menuOpen, setMenuOpen] = useState(false);

  const userMenuRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const name = userData?.name;
      if (name) setUsername(name);
    }
  }, []);

  // Cierra el menú si haces click fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Detecta si estamos en móvil (media query JS)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="topbar">
      {/* Hamburguesa solo en móvil */}
      <div className="hamburger-icon" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </div>

      {/* Usuario a la izquierda */}
      <div
        className="topbar-left user-menu-trigger"
        onClick={() => setMenuOpen((open) => !open)}
        ref={userMenuRef}
        tabIndex={0}
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        <FontAwesomeIcon icon={faUserCircle} className="icon-user" />
        <span className="username">{username}</span>
        {menuOpen && (
          <div className="user-dropdown-menu">
            <div className="user-dropdown-item">
              <FontAwesomeIcon icon={faCog} style={{ marginRight: 8 }} /> Configuración
            </div>
            {isMobile && (
              <div
                className="user-dropdown-item logout"
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: 8 }} /> Cerrar Sesión
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout a la derecha SOLO en escritorio */}
      {!isMobile && (
        <div className="topbar-right">
          <button onClick={handleLogout} className="btn-logout">
            <span className="logout-text">Cerrar Sesión</span>
            <FontAwesomeIcon icon={faSignOutAlt} className="icon-logout" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Topbar;
