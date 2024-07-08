import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginModal from '../LoginModal';
import styles from '../css/MiCuenta.module.css';

const MiCuenta = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className={styles.navbarDropdown} onMouseEnter={toggleDropdown} onMouseLeave={toggleDropdown}>
      <a className={styles.navbarDropdownLink} href="#" onClick={toggleDropdown}>
        <i className="fas fa-user"></i> Mi cuenta <i className="fas fa-chevron-down"></i>
      </a>
      {dropdownOpen && (
        <div className={styles.navbarDropdownContent}>
          <a className={styles.navbarDropdownContentLink} href="#" onClick={openModal}>
            <i className="fas fa-sign-in-alt"></i> Iniciar sesión / Registrarse
          </a>
          <Link className={styles.navbarDropdownContentLink} to="/cart">
            <i className="fas fa-shopping-cart"></i> Carrito de compras
          </Link>
        </div>
      )}
      <LoginModal isOpen={modalOpen} onClose={closeModal} />
    </div>
  );
};

export default MiCuenta;
