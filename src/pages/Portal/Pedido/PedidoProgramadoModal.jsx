import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faCheckCircle, faCreditCard, faMapMarkerAlt, faWallet } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../../context/AuthContext';
import styles from './css/PedidoProgramadoModal.module.css';
import bdMercado from '../../../services/bdMercado';

const PedidoProgramadoModal = ({ isOpen, onClose, cart }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timeError, setTimeError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [location, setLocation] = useState('');
  const [userAddresses, setUserAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const { user, refreshCartCount } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.related_data) {
      setUserAddresses([user.related_data.direccion]);
    }
  }, [user]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setTimeError('');
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    validateTime(time);
  };

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    if (loc !== 'Nueva Ubicación') {
      setNewAddress('');
      setIsAddingNewAddress(false);
      nextStep();
    } else {
      setIsAddingNewAddress(true);
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    if (method === 1) {
      // Contraentrega → confirmación directa
      setStep(5);
    } else if (method === 2) {
      // Mercado Pago → confirmación también, no pedimos datos manuales
      setStep(5);
    }
  };

  const validateTime = (time) => {
    const minTime = "08:00";
    const maxTime = isSunday() ? "14:00" : "17:00";

    if (time < minTime || time > maxTime) {
      setTimeError(`La hora debe estar entre ${minTime} y ${maxTime}${isSunday() ? " (Domingo)" : ""}.`);
    } else {
      setTimeError('');
    }
  };

  const isSunday = () => {
    if (!selectedDate) return false;
    return new Date(selectedDate).getDay() === 0;
  };

  const handleConfirm = async () => {
    const finalLocation = isAddingNewAddress ? newAddress : location;

    // Verificar que el carrito existe y no está vacío
    if (!cart?.productos || !Array.isArray(cart.productos) || cart.productos.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    try {
      console.log('Confirmando pedido programado para el usuario:', user.related_data.user_id);
      console.log('Carrito del usuario:', cart.productos);

      const productos = cart.productos.map((p) => ({
        producto_id: p.producto.id,
        cantidad: p.cantidad,
      }));

      // Si seleccionó Mercado Pago → crear preferencia y redirigir
      if (paymentMethod === 2) {
        const { data } = await bdMercado.post('/mercadopago/preferencia', {
          user_id: user.related_data.user_id,
          direccion_entrega: finalLocation,
          productos: productos,
          fecha_programada: selectedDate,
          hora_programada: selectedTime,
        });

        if (data.init_point) {
          // Vaciar carrito en backend solo después de crear la preferencia exitosamente
          await bdMercado.post('/carrito/vaciar', {
            user_id: user.related_data.user_id,
          });
          
          // Actualizar contador del carrito
          if (refreshCartCount) {
            await refreshCartCount(true);
          }
          
          // Redirige al checkout de Mercado Pago
          window.location.href = data.init_point;
          return;
        }
      } else if (paymentMethod === 1) {
        // Para contraentrega, crear el pedido directamente
        await bdMercado.post('/pedidos', {
          fecha: new Date().toISOString().split('T')[0], // fecha actual
          estado: 1,
          direccion_entrega: finalLocation,
          user_id: user.related_data.user_id,
          metodo_pago_id: 1,
          fecha_programada: selectedDate,
          hora_programada: selectedTime,
          productos: productos,
        });

        // Vaciar carrito en backend solo después de crear el pedido exitosamente
        await bdMercado.post('/carrito/vaciar', {
          user_id: user.related_data.user_id,
        });
        
        // Actualizar contador del carrito
        if (refreshCartCount) {
          await refreshCartCount(true);
        }
      }

      // Cerrar modal
      onClose();
      
      // Redirige a seguimiento
      navigate('/seguimiento');
    } catch (error) {
      console.error('Error al confirmar pedido programado:', error.response?.data || error.message);
      console.error('Error completo:', error);
      
      // Mostrar más detalles del error
      if (error.response) {
        alert(`Error del servidor: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`);
      } else if (error.request) {
        alert('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const nextStep = () => {
    if (step === 2) {
      if (!selectedTime) {
        setTimeError('Por favor seleccione una hora');
        return;
      }
      const minTime = "08:00";
      const maxTime = isSunday() ? "14:00" : "17:00";
      if (selectedTime < minTime || selectedTime > maxTime) {
        setTimeError(`La hora debe estar entre ${minTime} y ${maxTime}${isSunday() ? " (Domingo)" : ""}.`);
        return;
      }
    }
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const getMaxTime = () => isSunday() ? "14:00" : "17:00";
  const getTimeMessage = () => isSunday() 
    ? "Horario permitido: 08:00 a 14:00 (Domingo)" 
    : "Horario permitido: 08:00 a 17:00";

  return (
    isOpen && (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
          <div className={styles.content}>
            {step === 1 && (
              <div className={styles.step}>
                <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
                <h2>Selecciona tu fecha de entrega</h2>
                <input 
                  type="date" 
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]} 
                  onChange={(e) => handleDateSelect(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
            )}

            {step === 2 && (
              <div className={styles.step}>
                <FontAwesomeIcon icon={faClock} className={styles.icon} />
                <h2>Selecciona la hora de entrega</h2>
                <input 
                  type="time" 
                  value={selectedTime}
                  onChange={(e) => handleTimeSelect(e.target.value)}
                  className={styles.timeInput}
                  min="08:00"
                  max={getMaxTime()}
                />
                <p className={styles.note}>{getTimeMessage()}</p>
                {timeError && <p className={styles.error}>{timeError}</p>}
              </div>
            )}

            {step === 3 && (
              <div className={styles.step}>
                <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.icon} />
                <h2>Selecciona tu ubicación</h2>
                <div className={styles.options}>
                  {userAddresses.map((address, index) => (
                    <button
                      key={index}
                      className={`${styles.optionButton} ${location === address ? styles.selected : ''}`}
                      onClick={() => handleLocationSelect(address)}
                    >
                      <p>{address}</p>
                    </button>
                  ))}
                  <button
                    className={`${styles.optionButton} ${location === 'Nueva Ubicación' ? styles.selected : ''}`}
                    onClick={() => handleLocationSelect('Nueva Ubicación')}
                  >
                    <p>Añadir otra dirección</p>
                  </button>
                </div>
                {isAddingNewAddress && (
                  <input
                    type="text"
                    placeholder="Ingrese nueva dirección"
                    className={styles.newAddressInput}
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                  />
                )}
              </div>
            )}

            {step === 4 && (
              <div className={styles.step}>
                <FontAwesomeIcon icon={faCreditCard} className={styles.icon} />
                <h2>Selecciona tu método de pago</h2>
                <div className={styles.options}>
                  <button
                    className={`${styles.optionButton} ${paymentMethod === 1 ? styles.selected : ''}`}
                    onClick={() => handlePaymentMethodSelect(1)}
                  >
                    <FontAwesomeIcon icon={faWallet} />
                    <p>Pago contraentrega</p>
                  </button>
                  <button
                    className={`${styles.optionButton} ${paymentMethod === 2 ? styles.selected : ''}`}
                    onClick={() => handlePaymentMethodSelect(2)}
                  >
                    <FontAwesomeIcon icon={faCreditCard} />
                    <p>Mercado Pago</p>
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className={styles.step}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.icon} />
                <h2>Confirmar Pedido Programado</h2>
                <p>Revise su información antes de confirmar el pedido.</p>
                <p>Fecha: {selectedDate}</p>
                <p>Hora: {selectedTime}</p>
                <p>Ubicación: {isAddingNewAddress ? newAddress : location}</p>
                <p>
                  Método de Pago: {paymentMethod === 1 ? 'Pago Contraentrega' : 'Mercado Pago'}
                </p>
                <button className={styles.confirmButton} onClick={handleConfirm}>
                  Confirmar
                </button>
              </div>
            )}

            <div className={styles.navigation}>
              {step > 1 && (
                <button onClick={prevStep} className={styles.navButton}>
                  Anterior
                </button>
              )}
              {step < 5 && (
                <button
                  onClick={nextStep}
                  className={styles.navButton}
                  disabled={
                    (step === 1 && !selectedDate) ||
                    (step === 2 && (!selectedTime || timeError)) ||
                    (step === 3 && !location && !newAddress) ||
                    (step === 4 && !paymentMethod)
                  }
                >
                  Siguiente
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default PedidoProgramadoModal;