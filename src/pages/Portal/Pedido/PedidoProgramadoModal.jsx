import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faCheckCircle, faCreditCard, faMapMarkerAlt, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../../context/AuthContext';
import styles from './css/PedidoProgramadoModal.module.css';
import bdMercado from '../../../services/bdMercado';

const PedidoProgramadoModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timeError, setTimeError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [location, setLocation] = useState('');
  const [userAddresses, setUserAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const { user } = useContext(AuthContext);
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

  // === MANEJO DE PEDIDO SEGÚN MÉTODO DE PAGO ===

  // 1. PAGO CONTRAENTREGA
  const handleConfirmContraentrega = async () => {
    const finalLocation = isAddingNewAddress ? newAddress : location;
    const productos = JSON.parse(localStorage.getItem('carrito')) || [];
    if (!productos.length) {
      alert('Tu carrito está vacío.');
      return;
    }
    try {
      await bdMercado.post('/pedidos', {
        productos,
        fecha: selectedDate,
        estado: 1, // o el valor para "pendiente"
        direccion_entrega: finalLocation,
        user_id: user?.related_data?.user_id,
        metodo_pago_id: 1 // Ajusta según tu base de datos
      });
      // Limpia el carrito (opcional, según tu lógica)
      localStorage.removeItem('carrito');
      navigate('/seguimiento');
    } catch (error) {
      alert('No se pudo registrar el pedido.');
      console.error(error);
    }
  };

  // 2. MERCADO PAGO
  const handleMercadoPago = async () => {
    const finalLocation = isAddingNewAddress ? newAddress : location;
    const productos = JSON.parse(localStorage.getItem('carrito')) || [];
    if (!productos.length) {
      alert('Tu carrito está vacío.');
      return;
    }
    try {
      const response = await bdMercado.post('/mercadopago/preferencia-pedido', {
        productos,
        fecha: selectedDate,
        hora: selectedTime,
        direccion_entrega: finalLocation,
        user_id: user?.related_data?.user_id,
      });
      const { init_point } = response.data;
      window.location.href = init_point; // Redirige al checkout de Mercado Pago
    } catch (err) {
      alert('No se pudo iniciar el pago con Mercado Pago.');
      console.error(err);
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
                    className={`${styles.optionButton} ${paymentMethod === 'contraentrega' ? styles.selected : ''}`}
                    onClick={() => setPaymentMethod('contraentrega')}
                  >
                    <FontAwesomeIcon icon={faMoneyBill} style={{ marginRight: 8 }} />
                    <span>Pago Contraentrega</span>
                  </button>
                  <button
                    className={`${styles.optionButton} ${paymentMethod === 'mercadopago' ? styles.selected : ''}`}
                    onClick={() => setPaymentMethod('mercadopago')}
                  >
                    <img
                      src="/mercadopago-logo.png"
                      alt="Mercado Pago"
                      style={{ width: 32, marginRight: 8, verticalAlign: 'middle' }}
                    />
                    <span>Pagar con Mercado Pago</span>
                  </button>
                </div>
                {/* Botón para avanzar solo si seleccionó un método */}
                <div style={{ marginTop: '1rem' }}>
                  <button
                    className={styles.confirmButton}
                    onClick={nextStep}
                    disabled={!paymentMethod}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
            {step === 5 && (
              <div className={styles.step}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.icon} />
                <h2>Confirmar Pedido Programado</h2>
                <p>Fecha: {selectedDate}</p>
                <p>Hora: {selectedTime}</p>
                <p>Ubicación: {isAddingNewAddress ? newAddress : location}</p>
                <p>Método de Pago: {paymentMethod === 'contraentrega' ? 'Pago Contraentrega' : 'Mercado Pago'}</p>
                {paymentMethod === 'mercadopago' ? (
                  <button className={styles.confirmButton} onClick={handleMercadoPago}>
                    Confirmar y Pagar con Mercado Pago
                  </button>
                ) : (
                  <button className={styles.confirmButton} onClick={handleConfirmContraentrega}>
                    Confirmar Pedido (Pago Contraentrega)
                  </button>
                )}
              </div>
            )}
            <div className={styles.navigation}>
              {step > 1 && (
                <button onClick={prevStep} className={styles.navButton}>
                  Anterior
                </button>
              )}
              {step < 5 && (
                <button onClick={nextStep} className={styles.navButton}>
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
