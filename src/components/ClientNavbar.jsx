import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MiCuenta from '../pages/Portal/components/MiCuenta';
import LoginModal from '../pages/Portal/LoginModal';
import bdMercado from '../services/bdMercado';
import styles from '../styles/css/NavbarClient.module.css';
import logo from '../../public/Logo.svg';

const ClientNavbar = ({ onSearch, onCategorySelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

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

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
    navigate('/'); // Navega a la página principal para mostrar los resultados
  };

  const handleLogoClick = () => {
    navigate('/'); // Navega a la página principal cuando se hace click en el logo
    onSearch(''); // Limpia el término de búsqueda
  };

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLogo} onClick={handleLogoClick}>
        <img src={logo} alt="Logo" />
      </div>
      <div className={styles.navbarSearch}>
        <select className={styles.navbarCategories} onChange={(e) => onCategorySelect(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.nombre}</option>
          ))}
        </select>
        <input
          type="text"
          className={styles.navbarInput}
          placeholder="Hola, ¿qué estás buscando?"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onSearch(e.target.value);
          }}
        />
        <button className={styles.navbarSearchButton} onClick={handleSearch}>
          <i className="fas fa-search"></i>
        </button>
      </div>
      <div className={styles.navbarLinks}>
        <Link className={styles.navbarLink} to="/orders">
          <i className="fas fa-box"></i> Mis pedidos
        </Link>
        <MiCuenta onLoginClick={handleOpenLoginModal} />
        <Link className={styles.navbarLink} to="/carrito">
          <i className="fas fa-shopping-cart"></i>
          <span className={styles.navbarCartCount}>5</span>
        </Link>
      </div>
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />}
    </nav>
  );
};

export default ClientNavbar;
