import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faTimes, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
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
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // 👉 Nuevo state para completar perfil
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [profileForm, setProfileForm] = useState({
    dni: '',
    celular: '',
    direccion: '',
  });

  // 👀 Toggle contraseña
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({ ...profileForm, [name]: value });
    if (error) setError('');
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();

    // 👉 Validaciones
    if (!/^\d{8}$/.test(profileForm.dni)) {
      setError('El DNI debe tener exactamente 8 dígitos.');
      return;
    }
    if (!/^\d{9}$/.test(profileForm.celular)) {
      setError('El celular debe tener exactamente 9 dígitos.');
      return;
    }
    if (!profileForm.direccion.trim()) {
      setError('La dirección es obligatoria.');
      return;
    }

    setLoading(true);
    try {
      await bdMercado.post('/cliente/completar', profileForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      // actualizar localStorage con datos completos
      const data = JSON.parse(localStorage.getItem('data'));
      data.user.related_data = { ...data.user.related_data, ...profileForm };
      localStorage.setItem('data', JSON.stringify(data));

      onClose();
    } catch (err) {
      console.error('Error completando perfil:', err);
      setError('Hubo un problema al guardar tus datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await bdMercado.post('/login', formData);
      const userData = response.data;
      const token = userData.access_token;
      const userId = userData.user.related_data?.user_id;

      localStorage.setItem('data', JSON.stringify(userData));
      localStorage.setItem('token', token);

      saveData(userData);
      login(userData.user);

      if (userId) {
        const uuid = localStorage.getItem('carrito_uuid');
        if (uuid) {
          try {
            await bdMercado.post('/carrito/merge', { uuid, user_id: userId });
            localStorage.removeItem('carrito_uuid');
          } catch (mergeError) {
            localStorage.removeItem('carrito_uuid');
          }
        }
      }
      onClose();
      const redirectTo = localStorage.getItem('redirectAfterLogin');
      if (redirectTo) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectTo);
      }
    } catch (error) {
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
        <div className={`${styles.modal} ${showRegister ? styles.modalRegistro : ''}`}>
          <button className={styles.closeButton} onClick={handleClose} aria-label="Cerrar">
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div className={styles.modalContent}>
            <img src={logo} alt="Logo" className={styles.logo} />
            {needsProfileCompletion ? (
              <>
                <h2 className={styles.modalTitle}>Completa tu perfil</h2>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <form onSubmit={handleCompleteProfile} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="dni">DNI</label>
                    <input
                      type="text"
                      id="dni"
                      name="dni"
                      value={profileForm.dni}
                      onChange={handleProfileChange}
                      required
                      maxLength="8"
                      pattern="\d{8}"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="celular">Celular</label>
                    <input
                      type="text"
                      id="celular"
                      name="celular"
                      value={profileForm.celular}
                      onChange={handleProfileChange}
                      required
                      maxLength="9"
                      pattern="\d{9}"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="direccion">Dirección</label>
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      value={profileForm.direccion}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <button type="submit" className={styles.btn} disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </form>
              </>
            ) : showRegister ? (
              <RegistroModal onClose={onClose} setShowRegister={setShowRegister} />
            ) : (
              <>
                <h2 className={styles.modalTitle}>Inicia sesión</h2>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <form onSubmit={handleSubmit} className={styles.form} autoComplete="on">
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
                        autoComplete="username"
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
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className={styles.togglePasswordBtn}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>
                  <button type="submit" className={styles.btn} disabled={loading}>
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
                  <GoogleLogin 
                    onClose={onClose} 
                    setLoading={setLoading} 
                    setNeedsProfileCompletion={setNeedsProfileCompletion} // 👈 paso el setter
                  />
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
