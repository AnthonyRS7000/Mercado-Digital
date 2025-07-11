import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import bdMercado from '../../services/bdMercado';
import styles from './css/LoginCliente.module.css';
import logo from '../../../public/Logo.svg';
import GoogleLogin from './GoogleLogin';
import RegistroModal from './RegistroModal';

const LoginModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext);
  const { saveData } = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState(''); // Agregamos estado para manejar errores
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Limpiar errores previos
    
    try {
      const response = await bdMercado.post('/login', formData);
      const userData = response.data;
      const token = userData.access_token;
      const userId = userData.user.related_data?.user_id;

      localStorage.setItem('data', JSON.stringify(userData));
      localStorage.setItem('token', token);

      saveData(userData);
      login(userData.user);

      // ✅ Separar el merge del carrito del flujo principal del login
      if (userId) {
        const uuid = localStorage.getItem('carrito_uuid');
        if (uuid) {
          try {
            await bdMercado.post('/carrito/merge', { uuid, user_id: userId });
            localStorage.removeItem('carrito_uuid');
          } catch (mergeError) {
            // ✅ Error en merge no debe afectar el login
            console.error('Error al fusionar carrito (no crítico):', mergeError);
            // Opcional: remover el UUID aunque falle el merge
            localStorage.removeItem('carrito_uuid');
          }
        }
      }

      // ✅ Cerrar modal SIEMPRE después de login exitoso
      onClose();

      const redirectTo = localStorage.getItem('redirectAfterLogin');
      if (redirectTo) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectTo);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      // ✅ Solo mostrar error si realmente falló el LOGIN, no el merge
      setError('Email o contraseña incorrectos. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
    if (location.pathname === '/seguimiento') {
      navigate('/');
    }
  };

  return (
    isOpen && (
      <div className={styles.overlay} onClick={handleOverlayClick}>
        <div className={`${styles.modal} ${showRegister ? styles.modalWide : ''}`}>
          <button className={styles.closeButton} onClick={handleClose} aria-label="Cerrar">
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div className={styles.modalContent}>
            <img src={logo} alt="Logo" className={styles.logo} />
            {showRegister ? (
            <RegistroModal 
              onClose={onClose} 
              setShowRegister={setShowRegister} 
              styles={styles}
            />
            ) : (
              <>
                <h2 className={styles.modalTitle}>Inicia sesión</h2>
                
                {/* ✅ Mostrar mensaje de error si existe */}
                {error && (
                  <div className={styles.errorMessage} style={{
                    color: '#dc3545',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    padding: '12px',
                    marginBottom: '16px',
                    fontSize: '14px'
                  }}>
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className={styles.form}>
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

                  <button 
                    type="submit" 
                    className={styles.btn}
                    disabled={loading} // ✅ Deshabilitar botón durante carga
                  >
                    {loading ? 'Ingresando...' : 'Ingresar'}
                  </button>
                </form>
                <div className={styles.links}>
                  <a href="#" className={styles.link}>¿Olvidaste tu contraseña?</a>
                  <a onClick={() => setShowRegister(true)} className={styles.link}>
                    Regístrate si eres nuevo
                  </a>
                  <span className={styles.dividerText}>o</span>
                </div>
                <div className={styles.googleContainer}>
                  <GoogleLogin onClose={onClose} setLoading={setLoading} />
                </div>
              </>
            )}
            {loading && (
              <div className={styles.loaderOverlay}>
                <div className={styles.loader}></div>
                <p className={styles.loadingText}>Cargando, por favor espere...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default LoginModal;