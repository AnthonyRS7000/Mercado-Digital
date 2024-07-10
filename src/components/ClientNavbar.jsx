// src/components/ClientNavbar.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MiCuenta from '../pages/Portal/components/MiCuenta';
import styles from '../styles/css/NavbarClient.module.css';
import logo from '../../public/Logo.svg';

const ClientNavbar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
    navigate('/'); // Navega a la página principal para mostrar los resultados
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLogo}>
        <img src={logo} alt="Logo" />
      </div>
      <div className={styles.navbarSearch}>
        <select className={styles.navbarCategories}>
          <option>Todas las categorías</option>
        </select>
        <input
          type="text"
          className={styles.navbarInput}
          placeholder="Hola, ¿qué estás buscando?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={styles.navbarSearchButton} onClick={handleSearch}>
          <i className="fas fa-search"></i>
        </button>
      </div>
      <div className={styles.navbarLinks}>
        <Link className={styles.navbarLink} to="/orders">
          <i className="fas fa-box"></i> Mis pedidos
        </Link>
        <MiCuenta />
        <Link className={styles.navbarLink} to="/carrito">
          <i className="fas fa-shopping-cart"></i>
          <span className={styles.navbarCartCount}>5</span>
        </Link>
      </div>
    </nav>
  );
};

export default ClientNavbar;
