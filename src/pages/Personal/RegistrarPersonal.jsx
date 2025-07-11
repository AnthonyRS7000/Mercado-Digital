import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faIdCard, faPhone, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import bdMercado from '../../services/bdMercado';
import PersonalModal from './PersonalModal'; // Asegúrate de usar el componente correcto
import styles from '../../styles/css/RegistrarPersonal.module.css';

const RegistrarPersonal = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    celular: '',
    email: '',
    password: '',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [apoyoRegistrado, setApoyoRegistrado] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await bdMercado.post('/v1/apoyo', formData);
      const apoyoCompleto = {
        ...response.data.personal_sistema,
        user: response.data.user
      };
      setApoyoRegistrado(apoyoCompleto);
      setModalOpen(true);
    } catch (error) {
      console.error('Error registrando apoyo:', error);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <div className={styles.registerLogo}>
          <img src="/Logo.svg" alt="Logo" />
        </div>
        <h2>Registrar Apoyo</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="nombre">
              <FontAwesomeIcon icon={faUser} className={styles.faIcon} /> Nombre
            </label>
            <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
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
          <button type="submit" className={styles.btn}>Registrar Apoyo</button>
        </form>
      </div>
      <PersonalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        apoyo={apoyoRegistrado}
      />
    </div>
  );
};

export default RegistrarPersonal;
