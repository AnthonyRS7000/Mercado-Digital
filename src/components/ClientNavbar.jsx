import React, { useState, useContext } from 'react';
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
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  // 🔥 Ahora tomamos cartCount desde el AuthContext
  const { user, cartCount } = useContext(AuthContext);

  // Obtener categorías una sola vez
  useState(() => {
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

  // Buscar productos manualmente al enviar
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
    navigate('/');
  };

  // Buscar productos mientras escribe
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length > 2) {
      const fetchSearchResults = async () => {
        try {
          const response = await bdMercado.get(`/productos/search/${query}`);
          setSearchResults(response.data);
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      };
      fetchSearchResults();
    } else {
      setSearchResults([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleLogoClick = () => {
    navigate('/');
    onSearch('');
  };

  const handleOpenLoginModal = () => setIsLoginModalOpen(true);
  const handleCloseLoginModal = () => setIsLoginModalOpen(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarTitle} onClick={handleLogoClick}>
        Mercado Central
      </div>

      <div className={styles.navbarSearch}>
        <input
          type="text"
          className={styles.navbarInput}
          placeholder="Hola, ¿qué estás buscando?"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.navbarSearchButton} onClick={handleSearch}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
        {searchResults.length > 0 && (
          <div className={styles.searchResults}>
            {searchResults.map((product) => (
              <div key={product.id} className={styles.searchResultItem}>
                <Link to={`/producto/${product.id}`}>{product.nombre}</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.navbarLinks}>
        {user && (
          <Link className={styles.navbarLink} to="/seguimiento">
            <FontAwesomeIcon icon={faBox} /> Mis pedidos
          </Link>
        )}
        <MiCuenta onLoginClick={handleOpenLoginModal} />
        <Link className={styles.navbarLink} to="/carrito">
          <FontAwesomeIcon icon={faShoppingCart} />
          <span className={styles.navbarCartCount}>{cartCount}</span> {/* ✅ Aquí usamos el del contexto */}
        </Link>
      </div>

      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />}
    </nav>
  );
};

export default ClientNavbar;
