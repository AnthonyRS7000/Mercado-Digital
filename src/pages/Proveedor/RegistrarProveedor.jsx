import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBuilding, faMapMarkerAlt, faIdCard, faPhone, faEnvelope, faLock, faTags } from '@fortawesome/free-solid-svg-icons';
import bdMercado from '../../services/bdMercado';
import { AuthContext } from '../../context/AuthContext';
import styles from '../../styles/css/RegistrarProveedor.module.css';

const RegistrarProveedor = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    nombre: '',
    nombre_empresa: '',
    direccion: '',
    dni: '',
    celular: '',
    categoria_ids: [],
    email: '',
    password: ''
  });

  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await bdMercado.get('/v1/categorias');
        setCategorias(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'categoria_ids') {
      const options = e.target.options;
      const selectedValues = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected && !formData.categoria_ids.includes(parseInt(options[i].value))) {
          selectedValues.push(parseInt(options[i].value));
        }
      }
      setFormData({
        ...formData,
        [name]: [...formData.categoria_ids, ...selectedValues]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCategoryRemove = (id) => {
    setFormData({
      ...formData,
      categoria_ids: formData.categoria_ids.filter(catId => catId !== id)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bdMercado.post('/v1/proveedor', formData);
      alert('Proveedor registrado exitosamente');
    } catch (error) {
      console.error('Error registrando proveedor:', error);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <div className={styles.registerLogo}>
          <img src="/Logo.svg" alt="Logo" />
        </div>
        <h2>Registro de Proveedor</h2>
        <form onSubmit={handleSubmit}>
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
            <label htmlFor="direccion">
              <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.faIcon} /> Dirección
            </label>
            <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} required />
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
            <label htmlFor="categoria_ids">
              <FontAwesomeIcon icon={faTags} className={styles.faIcon} /> Categorías
            </label>
            <select id="categoria_ids" name="categoria_ids" multiple value={formData.categoria_ids} onChange={handleChange} required>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
              ))}
            </select>
            <div className={styles.selectedCategories}>
              {formData.categoria_ids.map(id => {
                const categoria = categorias.find(cat => cat.id === id);
                return (
                  <span key={id} className={styles.categoryTag}>
                    {categoria?.nombre}
                    <button type="button" onClick={() => handleCategoryRemove(id)}>x</button>
                  </span>
                );
              })}
            </div>
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

export default RegistrarProveedor;
