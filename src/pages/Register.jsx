import React, { useState } from 'react';
import bdMercado from '../services/bdMercado';
import '../styles/css/register.css'
const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    nombre_empresa: '',
    direccion: '',
    dni: '',
    celular: '',
    categoria_ids: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      categoria_ids: formData.categoria_ids.split(',').map(Number)
    };
    try {
      const response = await bdMercado.post('/proveedor', formattedData);
      console.log('Proveedor registrado:', response.data);
    } catch (error) {
      console.error('Error registrando proveedor:', error);
    }
  };

  return (
    <div className="register-form-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Registrar Proveedor</h2>
        <div className="form-group">
          <label>Nombre</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Nombre de la Empresa</label>
          <input type="text" name="nombre_empresa" value={formData.nombre_empresa} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Dirección</label>
          <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>DNI</label>
          <input type="text" name="dni" value={formData.dni} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Celular</label>
          <input type="text" name="celular" value={formData.celular} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Categorías (separadas por comas)</label>
          <input type="text" name="categoria_ids" value={formData.categoria_ids} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary">Registrar</button>
      </form>
    </div>
  );
};

export default Register;
