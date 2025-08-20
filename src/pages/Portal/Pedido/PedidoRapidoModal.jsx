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
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.related_data) {
      setUserAddresses([user.related_data.direccion]);
    }
  }, [user]);

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    setStep(3); // Saltar a confirmación
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

  const handleConfirm = async () => {
    const finalLocation = isAddingNewAddress ? newAddress : location;

    try {
      if (paymentMethod === 1) {
        // 🚚 CONTRAENTREGA → el padre crea el pedido y vacía carrito
        await onConfirm(paymentMethod, finalLocation);
        navigate('/seguimiento');
        return;
      }

      if (paymentMethod === 2) {
        // 💳 MERCADO PAGO → crear preferencia en el backend
        const { data } = await bdMercado.post('/mercadopago/preferencia', {
          user_id: user.related_data.user_id,
          direccion_entrega: finalLocation,
          fecha_programada: null,
          hora_programada: null,
        });

        if (data.init_point) {
          // 🔗 Redirigir al checkout de MP
          window.location.href = data.init_point;
        } else {
          alert('No se pudo generar la preferencia de pago');
        }
      }
    } catch (error) {
      console.error('Error al confirmar pedido:', error.response?.data || error.message);
      alert('Hubo un error al confirmar el pedido');
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
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
                    <p>Mercado Pago</p>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={styles.step}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.icon} />
                <h2>Confirmar Pedido</h2>
                <p>Revise su información antes de confirmar el pedido.</p>
                <p>
                  Método de Pago: {paymentMethod === 1 ? 'Pago Contraentrega' : 'Mercado Pago'}
                </p>
                <p>Ubicación: {isAddingNewAddress ? newAddress : location}</p>
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
              {step < 3 && (
                <button
                  onClick={nextStep}
                  className={styles.navButton}
                  disabled={(step === 1 && !location && !newAddress) || (step === 2 && !paymentMethod)}
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

export default PedidoRapidoModal;
