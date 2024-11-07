import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MiCuenta from '../pages/Portal/components/MiCuenta';
import LoginModal from '../pages/Portal/LoginModal';
import bdMercado from '../services/bdMercado';
import styles from '../styles/css/NavbarClient.module.css';
import logo from '../../public/Logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faShoppingCart, faUserTie, faSearch } from '@fortawesome/free-solid-svg-icons';

const ClientNavbar = ({ onSearch, onCategorySelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
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

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        let response;
        if (user?.related_data) {
          response = await bdMercado.get(`/carrito/user/${user.related_data.user_id}`);
        } else {
          const uuid = localStorage.getItem('carrito_uuid');
          if (uuid) {
            response = await bdMercado.get(`/carrito/uuid/${uuid}`);
          }
        }
        setCartCount(response?.data?.productos?.length || 0);
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartCount(0);
      }
    };
    fetchCartCount();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate('/');
    onSearch('');
  };

  const handleOpenLoginModal = () => setIsLoginModalOpen(true);
  const handleCloseLoginModal = () => setIsLoginModalOpen(false);

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
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={styles.navbarSearchButton} onClick={handleSearch}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
      <div className={styles.navbarLinks}>
        <Link className={styles.navbarLink} to="/login">
          <FontAwesomeIcon icon={faUserTie} /> Proveedor
        </Link>
        <Link className={styles.navbarLink} to="/orders">
          <FontAwesomeIcon icon={faBox} /> Mis pedidos
        </Link>
        <MiCuenta onLoginClick={handleOpenLoginModal} />
        <Link className={styles.navbarLink} to="/carrito">
          <FontAwesomeIcon icon={faShoppingCart} />
          <span className={styles.navbarCartCount}>{cartCount}</span>
        </Link>
      </div>
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />}
    </nav>
  );
};

export default ClientNavbar;
