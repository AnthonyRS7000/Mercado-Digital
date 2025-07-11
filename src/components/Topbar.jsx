import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import '../styles/css/Topbar.css';

const Topbar = ({ toggleSidebar }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('Usuario');

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const name = userData?.name;
      if (name) setUsername(name);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="topbar">
      <div className="hamburger-icon" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </div>

      <div className="topbar-content">
        <div className="topbar-user">
          <FontAwesomeIcon icon={faUserCircle} className="icon-user" />
          <span className="username">{username}</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Topbar;
