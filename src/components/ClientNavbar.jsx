import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bdMercado from '../services/bdMercado'; // Importa el servicio para obtener categorías
import styles from '../styles/css/NavbarClient.module.css';
import logo from '../../public/Logo.svg';
import MiCuenta from '../pages/Portal/components/MiCuenta'; // Importa el componente MiCuenta

const ClientNavbar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await bdMercado.get('/v1/categorias');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (onSearch) {
      onSearch(searchTerm);
    }
    navigate('/'); // Navega a la página principal para mostrar los resultados
  }, [searchTerm, onSearch, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
    navigate('/'); // Navega a la página principal para mostrar los resultados
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLogo} onClick={() => window.location.reload()}>
        <img src={logo} alt="Logo" />
      </div>
      <div className={styles.navbarSearch}>
        <select className={styles.navbarCategories}>
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.nombre}
            </option>
          ))}
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
        <a className={styles.navbarLink} href="/orders">
          <i className="fas fa-box"></i> Mis pedidos
        </a>
        <MiCuenta /> {/* Usa el componente MiCuenta */}
      </div>
    </nav>
  );
};

export default ClientNavbar;
