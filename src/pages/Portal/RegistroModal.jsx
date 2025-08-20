import React, { useEffect, useState } from 'react';
import bdMercado from '../../services/bdMercado';
import styles from './css/RegistroModal.module.css';
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
    confirmPassword: '',
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
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const errors = {};
    const namePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!formData.nombres.trim()) {
      errors.nombres = 'Los nombres son obligatorios.';
    } else if (!namePattern.test(formData.nombres.trim())) {
      errors.nombres = 'Solo letras, tildes y espacios.';
    }

    if (!formData.apellidos.trim()) {
      errors.apellidos = 'Los apellidos son obligatorios.';
    } else if (!namePattern.test(formData.apellidos.trim())) {
      errors.apellidos = 'Solo letras, tildes y espacios.';
    }

    if (!formData.dni.trim()) {
      errors.dni = 'El DNI es obligatorio.';
    } else if (!/^\d{8}$/.test(formData.dni)) {
      errors.dni = 'El DNI debe tener 8 dígitos.';
    }

    if (!formData.celular.trim()) {
      errors.celular = 'El celular es obligatorio.';
    } else if (!/^\d{9}$/.test(formData.celular)) {
      errors.celular = 'El celular debe tener 9 dígitos.';
    }

    if (!formData.direccion.trim()) {
      errors.direccion = 'La dirección es obligatoria.';
    } else if (formData.direccion.trim().length < 4) {
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

    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio.';
    } else if (!emailPattern.test(formData.email)) {
      errors.email = 'El email no tiene un formato válido.';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria.';
    } else if (!passwordPattern.test(formData.password)) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula, un número y un símbolo.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña.';
    } else if (formData.password !== formData.confirmPassword) {
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
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Ocurrió un error al registrar. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className={styles.registroContainer}>
      <h2 className={styles.registroTitle}>
        {step === 1 ? 'Información Personal' : 'Credenciales de Acceso'}
      </h2>
      
      <form onSubmit={handleRegister} noValidate>
        {step === 1 ? (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Nombres</label>
              <div className={styles.inputGroup}>
                <i className="bi bi-person" style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  zIndex: 2,
                  color: '#6c757d'
                }}></i>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  className={formErrors.nombres ? styles.inputError : ''}
                  placeholder="Ingresa tus nombres"
                />
              </div>
              {formErrors.nombres && (
                <span className={styles.errorText}>{formErrors.nombres}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Apellidos</label>
              <div className={styles.inputGroup}>
                <i className="bi bi-person" style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  zIndex: 2,
                  color: '#6c757d'
                }}></i>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className={formErrors.apellidos ? styles.inputError : ''}
                  placeholder="Ingresa tus apellidos"
                />
              </div>
              {formErrors.apellidos && (
                <span className={styles.errorText}>{formErrors.apellidos}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>DNI</label>
              <div className={styles.inputGroup}>
                <i className="bi bi-card-text" style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  zIndex: 2,
                  color: '#6c757d'
                }}></i>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  className={formErrors.dni ? styles.inputError : ''}
                  placeholder="12345678"
                  maxLength="8"
                />
              </div>
              {formErrors.dni && (
                <span className={styles.errorText}>{formErrors.dni}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Celular</label>
              <div className={styles.inputGroup}>
                <i className="bi bi-telephone" style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  zIndex: 2,
                  color: '#6c757d'
                }}></i>
                <input
                  type="text"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  className={formErrors.celular ? styles.inputError : ''}
                  placeholder="987654321"
                  maxLength="9"
                />
              </div>
              {formErrors.celular && (
                <span className={styles.errorText}>{formErrors.celular}</span>
              )}
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Dirección</label>
              <div className={styles.inputGroup}>
                <i className="bi bi-geo-alt" style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  zIndex: 2,
                  color: '#6c757d'
                }}></i>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className={formErrors.direccion ? styles.inputError : ''}
                  placeholder="Av. Ejemplo 123, Distrito, Ciudad"
                />
              </div>
              {formErrors.direccion && (
                <span className={styles.errorText}>{formErrors.direccion}</span>
              )}
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Preferencias de compra</label>
              <div className={styles.inputGroup}>
                <i className="bi bi-basket" style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  zIndex: 2,
                  color: '#6c757d'
                }}></i>
                <select
                  name="preferencias_compra"
                  value={formData.preferencias_compra}
                  onChange={handleChange}
                  className={formErrors.preferencias_compra ? styles.inputError : ''}
                >
                  <option value="">Seleccione una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              {formErrors.preferencias_compra && (
                <span className={styles.errorText}>{formErrors.preferencias_compra}</span>
              )}
            </div>

            <button type="button" className={styles.btn} onClick={handleNextStep}>
              Siguiente <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        ) : (
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Email</label>
              <div className={styles.inputGroup}>
                <i className="bi bi-envelope" style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  zIndex: 2,
                  color: '#6c757d'
                }}></i>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={formErrors.email ? styles.inputError : ''}
                  placeholder="tu-email@ejemplo.com"
                />
              </div>
              {formErrors.email && (
                <span className={styles.errorText}>{formErrors.email}</span>
              )}
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Contraseña</label>
              <div className={styles.inputGroup}>
                <i className="bi bi-lock" style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  zIndex: 2,
                  color: '#6c757d'
                }}></i>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={formErrors.password ? styles.inputError : ''}
                  placeholder="Mínimo 6 caracteres"
                  style={{ paddingRight: '40px' }}
                />
                <i 
                  className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"} 
                  style={{ 
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#6c757d',
                    zIndex: 3
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
              {formErrors.password && (
                <span className={styles.errorText}>{formErrors.password}</span>
              )}
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Confirmar Contraseña</label>
              <div className={styles.inputGroup}>
                <i className="bi bi-lock" style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  zIndex: 2,
                  color: '#6c757d'
                }}></i>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={formErrors.confirmPassword ? styles.inputError : ''}
                  placeholder="Repite tu contraseña"
                  style={{ paddingRight: '40px' }}
                />
                <i 
                  className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"} 
                  style={{ 
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#6c757d',
                    zIndex: 3
                  }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                ></i>
              </div>
              {formErrors.confirmPassword && (
                <span className={styles.errorText}>{formErrors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className={styles.btn}>
              <i className="bi bi-person-plus"></i> Registrarse
            </button>

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
    </div>
  );
};

export default RegistroModal;