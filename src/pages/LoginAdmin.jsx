import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import bdMercado from '../services/bdMercado';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../styles/css/LoginAdmin.css';

const LoginAdmin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { saveData } = useContext(DataContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMsg(null);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const goByRole = (numRol) => {
    if (numRol === 1) return navigate('/');
    switch (numRol) {
      case 2: return navigate('/admin/vender-producto');
      case 3: return navigate('/admin/alistar-pedido');
      case 4: return navigate('/admin/recoger-pedido');
      case 20: return navigate('/admin/dashboard');
      default: return navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const { data } = await bdMercado.post('/login', formData);

      localStorage.setItem('data', JSON.stringify(data));
      localStorage.setItem('token', data.access_token);
      saveData(data);
      login(data.user);

      setMsg({ type: 'success', text: 'Ingreso exitoso, redirigiendo…' });
      goByRole(data.user.num_rol);
    } catch (error) {
      const status = error?.response?.status;
      const apiMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Error al iniciar sesión. Intenta nuevamente.';

      if (status === 403) {
        setMsg({ type: 'warning', text: apiMsg });
      } else if (status === 401) {
        setMsg({ type: 'error', text: apiMsg || 'Credenciales inválidas.' });
      } else if (status === 422) {
        const errs = error?.response?.data?.errors;
        const flat = errs ? Object.values(errs).flat().join(' ') : apiMsg;
        setMsg({ type: 'error', text: flat });
      } else {
        setMsg({ type: 'error', text: apiMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-admin-container">
      <div className="login-admin-overlay" />
      <div className="login-admin-box">
        <h2>Intranet Mercado Central</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="login-admin-form-group">
            <label htmlFor="email">Email</label>
            <div className="login-admin-input-group">
              <span className="login-admin-input-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tucorreo@dominio.com"
              />
            </div>
          </div>

          <div className="login-admin-form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="login-admin-input-group">
              <span className="login-admin-input-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faLock} />
              </span>

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="********"
                minLength={8}
              />

              {/* Botón ojito */}
              <button
                type="button"
                className="login-admin-toggle-pass"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            <small className="login-admin-hint">Mínimo 8 caracteres</small>
          </div>

          {msg && (
            <div
              className={`login-admin-alert login-admin-alert-${msg.type}`}
              role="alert"
              aria-live="polite"
            >
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            className="login-admin-btn-primary"
            disabled={loading}
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <div className="login-admin-register-links">
          <p>¿No tienes cuenta? Entonces regístrate como:</p>
          <div className="register-buttons-row">
            <button
              className="login-admin-btn-secondary animated-btn"
              onClick={() => navigate('/register/proveedor')}
              disabled={loading}
            >
              Proveedor
            </button>
            <button
              className="login-admin-btn-secondary animated-btn"
              onClick={() => navigate('/register/delivery')}
              disabled={loading}
            >
              Delivery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
