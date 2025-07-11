import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import styles from '../css/MiCuenta.module.css';

const MiCuenta = ({ onLoginClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

const navigate = useNavigate();

const handleLogout = () => {
  logout();
  navigate('/'); // 👈 redirige sin recargar
};


  return (
    <div className={styles.navbarDropdown} onMouseEnter={toggleDropdown} onMouseLeave={toggleDropdown}>
<a className={styles.navbarDropdownLink} href="#" onClick={toggleDropdown}>
  <i className="fas fa-user"></i> 
  {user ? `Hola ${user.name.split(' ')[0]}` : 'Mi cuenta'} 
  <i className="fas fa-chevron-down"></i>
</a>


      {dropdownOpen && (
        <div className={styles.navbarDropdownContent}>
          {user ? (
            <>
              <Link className={styles.navbarDropdownContentLink} to="/seguimiento">
                <i className="fas fa-box"></i> Mis pedidos
              </Link>
              <Link className={styles.navbarDropdownContentLink} to="#" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Cerrar sesión
              </Link>
            </>
          ) : (
            <a className={styles.navbarDropdownContentLink} href="#" onClick={onLoginClick}>
              <i className="fas fa-sign-in-alt"></i> Iniciar sesión / Registrarse
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default MiCuenta;
