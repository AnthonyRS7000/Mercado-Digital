import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser, faBuilding, faMapMarkerAlt,
  faIdCard, faPhone, faEnvelope, faLock, faTags
} from "@fortawesome/free-solid-svg-icons";

import bdMercado from '../services/bdMercado';
import styles from '../styles/css/RegisterSolicitud.module.css';

const camposPorTipo = {
  proveedor: [
    { name: "nombre", label: "Nombre", icon: faUser, type: "text", required: true },
    { name: "nombre_empresa", label: "Nombre Empresa", icon: faBuilding, type: "text", required: true },
    { name: "direccion", label: "Dirección", icon: faMapMarkerAlt, type: "text", required: true },
    { name: "dni", label: "DNI", icon: faIdCard, type: "text", required: true, pattern: /^\d{8}$/, maxLength: 8 },
    { name: "celular", label: "Celular", icon: faPhone, type: "text", required: true, pattern: /^\d{9}$/, maxLength: 9 },
    { name: "email", label: "Email", icon: faEnvelope, type: "email", required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { name: "password", label: "Contraseña", icon: faLock, type: "password", required: true, minLength: 6 },
  ],
  delivery: [
    { name: "nombre", label: "Nombre", icon: faUser, type: "text", required: true },
    { name: "nombre_empresa", label: "Nombre Empresa", icon: faBuilding, type: "text", required: true },
    { name: "dni", label: "DNI", icon: faIdCard, type: "text", required: true, pattern: /^\d{8}$/, maxLength: 8 },
    { name: "celular", label: "Celular", icon: faPhone, type: "text", required: true, pattern: /^\d{9}$/, maxLength: 9 },
    { name: "email", label: "Email", icon: faEnvelope, type: "email", required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { name: "password", label: "Contraseña", icon: faLock, type: "password", required: true, minLength: 6 },
  ],
  personal_sistema: [
    { name: "nombre", label: "Nombre", icon: faUser, type: "text", required: true },
    { name: "dni", label: "DNI", icon: faIdCard, type: "text", required: true, pattern: /^\d{8}$/, maxLength: 8 },
    { name: "celular", label: "Celular", icon: faPhone, type: "text", required: true, pattern: /^\d{9}$/, maxLength: 9 },
    { name: "email", label: "Email", icon: faEnvelope, type: "email", required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { name: "password", label: "Contraseña", icon: faLock, type: "password", required: true, minLength: 6 },
  ]
};

const RegisterSolicitud = ({ tipo = 'proveedor' }) => {
  const [formData, setFormData] = useState({});
  const [msg, setMsg] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [errors, setErrors] = useState({});

  const campos = camposPorTipo[tipo] || camposPorTipo.proveedor;

  useEffect(() => {
    if (tipo === 'proveedor') {
      bdMercado.get('v1/categorias')
        .then(res => setCategorias(res.data))
        .catch(() => setCategorias([]));
    }
  }, [tipo]);

  const validate = () => {
    const newErrors = {};
    campos.forEach(campo => {
      const value = formData[campo.name] || '';
      if (campo.required && !value.trim()) {
        newErrors[campo.name] = 'Este campo es obligatorio';
      } else if (campo.pattern && !campo.pattern.test(value)) {
        newErrors[campo.name] = 'Formato inválido';
      } else if (campo.minLength && value.length < campo.minLength) {
        newErrors[campo.name] = `Debe tener al menos ${campo.minLength} caracteres`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, maxLength } = e.target;

    if (type === 'checkbox') {
      const current = formData.ids || [];
      const updated = checked ? [...current, parseInt(value)] : current.filter(id => id !== parseInt(value));
      setFormData((prev) => ({ ...prev, ids: updated }));
    } else {
      let newValue = value;

      if (name === 'dni' || name === 'celular') {
        newValue = newValue.replace(/\D/g, '');
        if (maxLength) newValue = newValue.slice(0, maxLength);
      }

      setFormData((prev) => ({ ...prev, [name]: newValue }));
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!validate()) return;

    try {
      const payload = { ...formData, tipo };
      await bdMercado.post('/solicitudes', payload);
      setMsg({ type: 'success', text: '¡Solicitud enviada correctamente! Un administrador debe aprobarla.' });
      setFormData({});
    } catch (error) {
      const err = error.response?.data?.errors || error.response?.data?.error || "Error al enviar solicitud";
      setMsg({
        type: 'error',
        text: typeof err === "object" ? Object.values(err).join(", ") : err
      });
    }
  };

  return (
    <form className={styles.formBox} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Registro de {tipo?.replace('_', ' ').toUpperCase()}</h2>

      <div className={styles.fieldsGrid}>
        {campos.map((campo) => (
          <div className={styles.formGroup} key={campo.name}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={campo.icon} className={styles.labelIcon} />
              {campo.label}
            </label>
            <input
              type={campo.type}
              name={campo.name}
              value={formData[campo.name] || ""}
              onChange={handleChange}
              autoComplete="off"
              maxLength={campo.maxLength || undefined}
              className={`${styles.input} ${errors[campo.name] ? styles.invalid : ''}`}
            />
            {errors[campo.name] && <span className={styles.errorText}>{errors[campo.name]}</span>}
          </div>
        ))}

        {tipo === 'proveedor' && (
          <div className={styles.formGroup + ' ' + styles.fullWidth}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faTags} className={styles.labelIcon} />
              Categorías
            </label>
            <div className={styles.checkboxGroup}>
              {categorias.map((cat) => (
                <label key={cat.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value={cat.id}
                    checked={formData.ids?.includes(cat.id) || false}
                    onChange={handleChange}
                  /> {cat.nombre}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <button className={styles.btn} type="submit">Enviar solicitud</button>
      {msg && <div className={`${styles.msg} ${styles[msg.type]}`}>{msg.text}</div>}
    </form>
  );
};

export default RegisterSolicitud;
