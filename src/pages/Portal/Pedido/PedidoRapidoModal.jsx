import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faMapMarkerAlt, faWallet, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../../context/AuthContext';
import styles from './css/PedidoRapidoModal.module.css';
import bdMercado from '../../../services/bdMercado';

const PedidoRapidoModal = ({ isOpen, onClose, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [location, setLocation] = useState('');
  const [userAddresses, setUserAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    walletInfo: ''
  });
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.related_data) {
      setUserAddresses([user.related_data.direccion]);
    }
  }, [user]);

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    if (method === 1) {
      setStep(3); // Skip to confirmation step for cash on delivery
    } else {
      nextStep(); // Go to payment details step for card or wallet
    }
  };

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    if (loc !== 'Nueva Ubicación') {
      setNewAddress('');
      setIsAddingNewAddress(false);
      nextStep(); // Avanza automáticamente al paso 2
    } else {
      setIsAddingNewAddress(true);
    }
  };
  

  const handleConfirm = async () => {
    const finalLocation = isAddingNewAddress ? newAddress : location;
  
    // Llama a la función onConfirm pasada por el padre
    onConfirm(paymentMethod, finalLocation, paymentDetails);
  
    // Aquí agregarás la lógica para vaciar el carrito después de confirmar el pedido
    try {
      console.log('Confirmando pedido para el usuario:', user.related_data.user_id);
  
      // Llama a la API para vaciar el carrito
      const vaciarCarritoResponse = await bdMercado.post('/carrito/vaciar', { user_id: user.related_data.user_id });
  
      // Verifica la respuesta de la API
      console.log('Respuesta al vaciar carrito:', vaciarCarritoResponse.data);
  
      // Redirige a la página de seguimiento
      navigate('/seguimiento');
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
      alert('Hubo un error al vaciar el carrito');
    }
  };
  

  const handleChangePaymentDetails = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

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
            {step === 2 && (
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
                    <p>Pago con tarjeta</p>
                  </button>
                  <button
                    className={`${styles.optionButton} ${paymentMethod === 3 ? styles.selected : ''}`}
                    onClick={() => handlePaymentMethodSelect(3)}
                  >
                    <FontAwesomeIcon icon={faWallet} />
                    <p>Billetera electrónica</p>
                  </button>
                </div>
              </div>
            )}
            {step === 3 && (paymentMethod === 2 || paymentMethod === 3) && (
              <div className={styles.step}>
                <FontAwesomeIcon icon={faCreditCard} className={styles.icon} />
                <h2>Ingresa los detalles de tu {paymentMethod === 2 ? 'tarjeta' : 'billetera electrónica'}</h2>
                {paymentMethod === 2 && (
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="Número de tarjeta"
                      value={paymentDetails.cardNumber}
                      onChange={handleChangePaymentDetails}
                    />
                    <input
                      type="text"
                      name="cardExpiry"
                      placeholder="Fecha de expiración (MM/AA)"
                      value={paymentDetails.cardExpiry}
                      onChange={handleChangePaymentDetails}
                    />
                    <input
                      type="text"
                      name="cardCVC"
                      placeholder="CVC"
                      value={paymentDetails.cardCVC}
                      onChange={handleChangePaymentDetails}
                    />
                  </div>
                )}
                {paymentMethod === 3 && (
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      name="walletInfo"
                      placeholder="Información de la billetera"
                      value={paymentDetails.walletInfo}
                      onChange={handleChangePaymentDetails}
                    />
                  </div>
                )}
              </div>
            )}
            {step === 3 && paymentMethod === 1 && (
              <div className={styles.step}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.icon} />
                <h2>Confirmar Pedido</h2>
                <p>Revise su información antes de confirmar el pedido.</p>
                <p>Método de Pago: {paymentMethod === 1 ? 'Pago Contraentrega' : paymentMethod === 2 ? 'Pago con tarjeta' : 'Billetera electrónica'}</p>
                <p>Ubicación: {isAddingNewAddress ? newAddress : location}</p>
                <button className={styles.confirmButton} onClick={handleConfirm}>
                  Confirmar
                </button>
              </div>
            )}
            {step === 4 && (
              <div className={styles.step}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.icon} />
                <h2>Confirmar Pedido</h2>
                <p>Revise su información antes de confirmar el pedido.</p>
                <p>Método de Pago: {paymentMethod === 1 ? 'Pago Contraentrega' : paymentMethod === 2 ? 'Pago con tarjeta' : 'Billetera electrónica'}</p>
                <p>Ubicación: {isAddingNewAddress ? newAddress : location}</p>
              </div>
            )}

            <div className={styles.navigation}>
              {step > 1 && (
                <button onClick={prevStep} className={styles.navButton}>
                  Anterior
                </button>
              )}           
              {step < 4 && !(step === 3 && paymentMethod === 1) && (
                <button 
                  onClick={nextStep} 
                  className={styles.navButton}
                  disabled={
                    (step === 1 && !location && !newAddress) || 
                    (step === 2 && !paymentMethod) ||
                    (step === 3 && (paymentMethod !== 1 && 
                      ((paymentMethod === 2 && (!paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCVC)) ||
                      (paymentMethod === 3 && !paymentDetails.walletInfo))))
                  }
                >
                  Siguiente
                </button>
              )}
              {step === 4 && (
                <button onClick={handleConfirm} className={styles.navButton}>
                  Confirmar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default PedidoRapidoModal;
