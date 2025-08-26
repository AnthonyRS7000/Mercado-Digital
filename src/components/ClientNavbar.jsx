import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MiCuenta from '../pages/Portal/components/MiCuenta';
import LoginModal from '../pages/Portal/LoginModal';
import bdMercado from '../services/bdMercado';
import styles from '../styles/css/NavbarClient.module.css';
import logo from '../../public/logo_crema.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faShoppingCart, faSearch } from '@fortawesome/free-solid-svg-icons';

const ClientNavbar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const { user, cartCount } = useContext(AuthContext);

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
    navigate('/');
  };

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
      {/* Fila superior */}
      <div className={styles.navbarTop}>
        <div className={styles.logoContainer} onClick={handleLogoClick}>
          <img src={logo} alt="Logo" className={styles.logo} />
          <span className={styles.navbarTitle}>Mercado Central</span>
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

        {/* Links (desktop) */}
        <div className={styles.navbarLinks}>
          {user && (
            <Link className={styles.navbarLink} to="/seguimiento">
              <FontAwesomeIcon icon={faBox} /> Mis pedidos
            </Link>
          )}
          <MiCuenta onLoginClick={handleOpenLoginModal} />
          <Link className={styles.navbarLink} to="/carrito">
            <FontAwesomeIcon icon={faShoppingCart} />
            <span className={styles.navbarCartCount}>{cartCount}</span>
          </Link>
        </div>
      </div>

      {/* Fila inferior (solo en móvil) */}
      <div className={styles.navbarBottom}>
        {user && (
          <Link className={styles.navbarLink} to="/seguimiento">
            <FontAwesomeIcon icon={faBox} /> Mis pedidos
          </Link>
        )}
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
