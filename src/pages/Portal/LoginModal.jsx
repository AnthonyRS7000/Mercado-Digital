import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthContext } from '../../context/AuthContext';
import bdMercado from '../../services/bdMercado';
import styles from './css/LoginCliente.module.css';
import logo from '../../../public/Logo.svg';

const LoginModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await bdMercado.post('/login', formData);
      const userData = response.data.user;
      const token = response.data.access_token;

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      login(userData);
      onClose();
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    isOpen && (
      <div className={styles.overlay} onClick={handleOverlayClick}>
        <div className={styles.modal}>
          <button className={styles.closeButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div className={styles.modalContent}>
            <img src={logo} alt="Logo" className={styles.logo} />
            <h2>Ingresa tus credenciales</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <div className={styles.inputGroup}>
                  <span className={styles.inputGroupIcon}>
                    <FontAwesomeIcon icon={faEnvelope} />
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="password">Contraseña</label>
                <div className={styles.inputGroup}>
                  <span className={styles.inputGroupIcon}>
                    <FontAwesomeIcon icon={faLock} />
                  </span>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <button type="submit" className={styles.btn}>Ingresar</button>
            </form>
            <div className={styles.links}>
              <a href="#">¿Olvidaste tu contraseña?</a>
              <a href="/register">Regístrate si eres nuevo</a>
              <button className={`${styles.btn} ${styles.btnGoogle}`}>
                <FontAwesomeIcon icon={faGoogle} /> Ingresar con Google
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default LoginModal;
