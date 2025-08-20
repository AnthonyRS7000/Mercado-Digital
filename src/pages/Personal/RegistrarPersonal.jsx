// src/pages/RegistrarPersonal.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faIdCard, faPhone, faEnvelope, faLock
} from '@fortawesome/free-solid-svg-icons';
import bdMercado from '../../services/bdMercado';
import styles from '../../styles/css/RegistrarPersonal.module.css';

/** Modal simple (inline) */
const ConfirmModal = ({ open, onClose, personal }) => {
  if (!open) return null;
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <h3>Personal registrado</h3>
        <div className={styles.modalBody}>
          <p><strong>Nombre:</strong> {personal?.nombre || '-'}</p>
          <p><strong>DNI:</strong> {personal?.dni || '-'}</p>
          <p><strong>Celular:</strong> {personal?.celular || '-'}</p>
          <p><strong>Email:</strong> {personal?.user?.email || personal?.email || '-'}</p>
        </div>
        <button className={styles.modalBtn} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

const RegistrarPersonal = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    celular: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [registrado, setRegistrado] = useState(null);
  const [apiError, setApiError] = useState(null); // string

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApiError(null);

    // Filtros numéricos para DNI/CELULAR
    if (name === 'dni') {
      const soloNums = value.replace(/\D/g, '').slice(0, 8);
      return setFormData({ ...formData, dni: soloNums });
    }
    if (name === 'celular') {
      const soloNums = value.replace(/\D/g, '').slice(0, 9);
      return setFormData({ ...formData, celular: soloNums });
    }

    setFormData({ ...formData, [name]: value });
  };

  const parseCreado = (data) => {
    // Intentamos capturar el objeto del personal y del user según posibles claves
    const personal =
      data?.apoyo ||
      data?.personal ||
      data?.personal_sistema ||
      data?.Personal_Sistema ||
      data?.Personal ||
      data;

    return {
      ...personal,
      user: data?.user || personal?.user || null,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setLoading(true);
    try {
      const { data } = await bdMercado.post('/v1/apoyo', formData);
      const creado = parseCreado(data);
      setRegistrado(creado);
      setModalOpen(true);
      // Limpiar form
      setFormData({
        nombre: '',
        dni: '',
        celular: '',
        email: '',
        password: ''
      });
    } catch (error) {
      // Errores de validación 422
      if (error?.response?.status === 422) {
        const errs = error?.response?.data?.errors;
        const flat = errs ? Object.values(errs).flat().join(' ') : null;
        setApiError(flat || 'Error de validación. Revisa los campos.');
      } else {
        const msg =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          'No se pudo registrar. Intenta nuevamente.';
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <h2 className={styles.title}>Registro de Personal de Sistema</h2>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="nombre">
              <FontAwesomeIcon icon={faUser} className={styles.faIcon} /> Nombre
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Nombre y apellidos"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dni">
              <FontAwesomeIcon icon={faIdCard} className={styles.faIcon} /> DNI
            </label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              required
              placeholder="8 dígitos"
              inputMode="numeric"
              maxLength={8}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="celular">
              <FontAwesomeIcon icon={faPhone} className={styles.faIcon} /> Celular
            </label>
            <input
              type="text"
              id="celular"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              required
              placeholder="9 dígitos"
              inputMode="numeric"
              maxLength={9}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">
              <FontAwesomeIcon icon={faEnvelope} className={styles.faIcon} /> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tucorreo@dominio.com"
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">
              <FontAwesomeIcon icon={faLock} className={styles.faIcon} /> Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {apiError && (
            <div className={styles.errorBox} role="alert">
              {apiError}
            </div>
          )}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Registrando…' : 'Registrar'}
          </button>
        </form>
      </div>

      <ConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        personal={registrado}
      />
    </div>
  );
};

export default RegistrarPersonal;
