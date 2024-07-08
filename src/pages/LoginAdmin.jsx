import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import bdMercado from '../services/bdMercado';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import '../styles/css/LoginAdmin.css';

const LoginAdmin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await bdMercado.post('/login', formData);
      const userData = response.data.user;
      const token = response.data.access_token;
      
      // Guardar usuario y token en el localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);

      // Llamar a la función login del contexto
      login(userData);

      // Redirigir según el rol
      if (userData.num_rol === 2) {
        navigate('/admin/vender-producto');
      } else if (userData.num_rol === 3) {
        navigate('/admin/alistar-pedido');
      } else if (userData.num_rol === 4) {
        navigate('/admin/entregar-pedido');
      } else if (userData.num_rol === 20) {
        navigate('/admin/dashboard');
      } else {
        navigate('/portal');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Bienvenido a la Intranet del Mercado Digital</h2>
        <h2>Proveedores, Delivery, Personal y Admin</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div className="input-group">
              <span className="input-group-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-group">
              <span className="input-group-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Ingresar</button>
        </form>
        <div className="register-links">
          <p>¿No tienes cuenta? Regístrate en los siguientes enlaces:</p>
          <button className="btn btn-secondary" onClick={() => navigate('/register/delivery')}>Registro Delivery</button>
          <button className="btn btn-secondary" onClick={() => navigate('/register/proveedor')}>Registro Proveedor</button>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
