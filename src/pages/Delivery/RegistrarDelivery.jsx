import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBuilding, faIdCard, faPhone, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import bdMercado from '../../services/bdMercado';
import styles from '../../styles/css/RegistrarDelivery.module.css';

const RegistrarDelivery = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    nombre_empresa: '',
    dni: '',
    celular: '',
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
    try {
      await bdMercado.post('/v1/delivery', formData);

      // Limpiar campos después de registrar
      setFormData({
        nombre: '',
        nombre_empresa: '',
        dni: '',
        celular: '',
        email: '',
        password: ''
      });

      alert('Delivery registrado exitosamente');
    } catch (error) {
      console.error('Error registrando delivery:', error);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <h2 className={styles.title}>Registro de Delivery</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="nombre">
              <FontAwesomeIcon icon={faUser} className={styles.faIcon} /> Nombre
            </label>
            <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="nombre_empresa">
              <FontAwesomeIcon icon={faBuilding} className={styles.faIcon} /> Nombre de la Empresa
            </label>
            <input type="text" id="nombre_empresa" name="nombre_empresa" value={formData.nombre_empresa} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="dni">
              <FontAwesomeIcon icon={faIdCard} className={styles.faIcon} /> DNI
            </label>
            <input type="text" id="dni" name="dni" value={formData.dni} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="celular">
              <FontAwesomeIcon icon={faPhone} className={styles.faIcon} /> Celular
            </label>
            <input type="text" id="celular" name="celular" value={formData.celular} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">
              <FontAwesomeIcon icon={faEnvelope} className={styles.faIcon} /> Email
            </label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">
              <FontAwesomeIcon icon={faLock} className={styles.faIcon} /> Contraseña
            </label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <button type="submit" className={styles.btn}>Registrar</button>
        </form>
      </div>
    </div>
  );
};

export default RegistrarDelivery;
