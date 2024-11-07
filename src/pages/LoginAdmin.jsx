import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import bdMercado from '../services/bdMercado';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import '../styles/css/LoginAdmin.css';

const LoginAdmin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { saveData } = useContext(DataContext);

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
      const userData = response.data;

      console.log('Response:', userData);

      const token = response.data.access_token;
      const userId = userData.user.id; // Asegúrate de obtener el user_id del objeto user principal

      console.log('Token:', token);
      console.log('UserId:', userId);

      localStorage.setItem('data', JSON.stringify(userData));
      localStorage.setItem('token', token);

      saveData(userData);
      login(userData.user);

      const uuid = localStorage.getItem('carrito_uuid');
      if (uuid && userData.user.related_data) { // Manejar carrito solo si hay related_data
        try {
          const mergeResponse = await bdMercado.post('/carrito/merge', { uuid, user_id: userData.user.related_data.user_id });
          console.log('Merge Response:', mergeResponse.data);
          localStorage.removeItem('carrito_uuid');
        } catch (mergeError) {
          console.error('Error merging cart:', mergeError);
        }
      }

      // Redirigir según el rol
      switch (userData.user.num_rol) {
        case 2:
          navigate('/admin/vender-producto');
          break;
        case 3:
          navigate('/admin/alistar-pedido');
          break;
        case 4:
          navigate('/admin/entregar-pedido');
          break;
        case 20:
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
          break;
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
