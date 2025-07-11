import React, { useEffect, useState } from 'react';
import bdMercado from '../../services/bdMercado';
import styles from './css/LoginCliente.module.css';
// Importar iconos de Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css';

const RegistroModal = ({ onClose, setShowRegister }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    celular: '',
    direccion: '',
    preferencias_compra: '',
    email: '',
    password: '',
    confirmPassword: '', // Nuevo campo para confirmar contraseña
  });

  const [categorias, setCategorias] = useState([]);
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await bdMercado.get('/v1/categorias');
        setCategorias(res.data);
      } catch (err) {
        console.error('Error cargando categorías:', err);
      }
    };
    fetchCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    const errors = {};
    const namePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!namePattern.test(formData.nombres.trim())) {
      errors.nombres = 'Solo letras, tildes y espacios.';
    }

    if (!namePattern.test(formData.apellidos.trim())) {
      errors.apellidos = 'Solo letras, tildes y espacios.';
    }

    if (!/^\d{8}$/.test(formData.dni)) {
      errors.dni = 'El DNI debe tener 8 dígitos.';
    }

    if (!/^\d{9}$/.test(formData.celular)) {
      errors.celular = 'El celular debe tener 9 dígitos.';
    }

    if (formData.direccion.trim().length < 4) {
      errors.direccion = 'La dirección debe tener al menos 4 caracteres.';
    }

    if (!formData.preferencias_compra) {
      errors.preferencias_compra = 'Selecciona una categoría.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

    if (!emailPattern.test(formData.email)) {
      errors.email = 'El email no tiene un formato válido.';
    }

    if (!passwordPattern.test(formData.password)) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula, un número y un símbolo.';
    }

    // Validación para confirmar contraseña
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setFormErrors({});
      setStep(2);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    try {
      const payload = {
        nombre: `${formData.nombres} ${formData.apellidos}`,
        dni: formData.dni,
        celular: formData.celular,
        direccion: formData.direccion,
        preferencias_compra: formData.preferencias_compra,
        email: formData.email,
        password: formData.password,
      };

      await bdMercado.post('/v1/cliente', payload);
      alert('Registro exitoso. Ya puedes iniciar sesión.');
      setShowRegister(false);
    } catch (err) {
      console.error('Error registrando:', err);
      alert('Ocurrió un error al registrar. Intenta nuevamente.');
    }
  };

  // Estilos adicionales para los iconos y el contenedor de errores
  const iconStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    cursor: 'pointer',
    color: '#6c757d'
  };

  const inputGroupStyle = {
    position: 'relative',
    width: '100%'
  };

  const errorContainerStyle = {
    height: '16px',
    fontSize: '0.75rem',
    color: 'red',
    marginTop: '1px',
    overflow: 'hidden'
  };

  return (
    <form onSubmit={handleRegister} noValidate style={{ maxHeight: '650px', overflowY: 'auto' }}>
      {step === 1 ? (
        <div className={styles.formGrid} style={{ gap: '8px' }}>
          <div className={styles.formGroup} style={{ marginBottom: '8px' }}>
            <label>Nombres</label>
            <div style={inputGroupStyle}>
              <i className="bi bi-person" style={{ color: '#6c757d',position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}></i>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                className={formErrors.nombres ? styles.inputError : ''}
                style={{ paddingLeft: '30px', height: '36px' }}
              />
            </div>
            <div style={errorContainerStyle}>
              {formErrors.nombres && <span className={styles.errorText}>{formErrors.nombres}</span>}
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '8px' }}>
            <label>Apellidos</label>
            <div style={inputGroupStyle}>
              <i className="bi bi-person" style={{ color: '#6c757d',position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}></i>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className={formErrors.apellidos ? styles.inputError : ''}
                style={{ paddingLeft: '30px', height: '36px' }}
              />
            </div>
            <div style={errorContainerStyle}>
              {formErrors.apellidos && <span className={styles.errorText}>{formErrors.apellidos}</span>}
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '8px' }}>
            <label>DNI</label>
            <div style={inputGroupStyle}>
              <i className="bi bi-card-text" style={{ color: '#6c757d',position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}></i>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                className={formErrors.dni ? styles.inputError : ''}
                style={{ paddingLeft: '30px', height: '36px' }}
              />
            </div>
            <div style={errorContainerStyle}>
              {formErrors.dni && <span className={styles.errorText}>{formErrors.dni}</span>}
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '8px' }}>
            <label>Celular</label>
            <div style={inputGroupStyle}>
              <i className="bi bi-telephone" style={{ color: '#6c757d',position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}></i>
              <input
                type="text"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                className={formErrors.celular ? styles.inputError : ''}
                style={{ paddingLeft: '30px', height: '36px' }}
              />
            </div>
            <div style={errorContainerStyle}>
              {formErrors.celular && <span className={styles.errorText}>{formErrors.celular}</span>}
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ marginBottom: '8px' }}>
            <label>Dirección</label>
            <div style={inputGroupStyle}>
              <i className="bi bi-geo-alt" style={{color: '#6c757d', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}></i>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className={formErrors.direccion ? styles.inputError : ''}
                style={{ paddingLeft: '30px', height: '36px' }}
              />
            </div>
            <div style={errorContainerStyle}>
              {formErrors.direccion && <span className={styles.errorText}>{formErrors.direccion}</span>}
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ marginBottom: '8px' }}>
            <label>Preferencias de compra</label>
            <div style={inputGroupStyle}>
              <i className="bi bi-basket" style={{ color: '#6c757d',position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}></i>
              <select
                name="preferencias_compra"
                value={formData.preferencias_compra}
                onChange={handleChange}
                className={formErrors.preferencias_compra ? styles.inputError : ''}
                style={{ paddingLeft: '30px', height: '36px' }}
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            <div style={errorContainerStyle}>
              {formErrors.preferencias_compra && <span className={styles.errorText}>{formErrors.preferencias_compra}</span>}
            </div>
          </div>

          <div className={styles.formGroup} style={{ width: '100%', textAlign: 'center', marginTop: '2px' }}>
            <button type="button" className={styles.btn} onClick={handleNextStep}>
              Siguiente <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.formGrid} style={{ gap: '8px' }}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ marginBottom: '8px' }}>
            <label>Email</label>
            <div style={inputGroupStyle}>
              <i className="bi bi-envelope" style={{ color: '#6c757d',position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}></i>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={formErrors.email ? styles.inputError : ''}
                style={{ paddingLeft: '30px', height: '36px' }}
              />
            </div>
            <div style={errorContainerStyle}>
              {formErrors.email && <span className={styles.errorText}>{formErrors.email}</span>}
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ marginBottom: '8px' }}>
            <label>Contraseña</label>
            <div style={inputGroupStyle}>
              <i className="bi bi-lock" style={{color: '#6c757d', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}></i>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={formErrors.password ? styles.inputError : ''}
                style={{ paddingLeft: '30px', paddingRight: '40px', height: '36px' }}
              />
              <i 
                className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"} 
                style={iconStyle}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
            <div style={errorContainerStyle}>
              {formErrors.password && <span className={styles.errorText}>{formErrors.password}</span>}
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ marginBottom: '8px' }}>
            <label>Confirmar Contraseña</label>
            <div style={inputGroupStyle}>
              <i className="bi bi-lock" style={{ color: '#6c757d',position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}></i>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={formErrors.confirmPassword ? styles.inputError : ''}
                style={{ paddingLeft: '30px', paddingRight: '40px', height: '36px' }}
              />
              <i 
                className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"} 
                style={iconStyle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              ></i>
            </div>
            <div style={errorContainerStyle}>
              {formErrors.confirmPassword && <span className={styles.errorText}>{formErrors.confirmPassword}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <button type="submit" className={styles.btn}>
              <i className="bi bi-person-plus"></i> Registrarse
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStep(1)}
            className={styles.linkButton}
          >
            <i className="bi bi-arrow-left"></i> Volver
          </button>
        </div>
      )}
    </form>
  );
};

export default RegistroModal;