import React, { useState, useEffect, useContext } from 'react';
import bdMercado from '../../../../services/bdMercado';
import './css/Modal.css';
import { AuthContext } from '../../../../context/AuthContext';
import { toast } from 'react-toastify';

const PesoModal = ({ isOpen, onClose, productId, productName }) => {
  const [weight, setWeight] = useState('');
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState(null);
  const [view, setView] = useState('form');

  // Contexto global para refresh
  const { user, guestUuid, refreshCartCount } = useContext(AuthContext);

  useEffect(() => {
    if (weight && productId && !isNaN(parseFloat(weight))) {
      calculatePrice();
    }
    // eslint-disable-next-line
  }, [weight, productId]);

  // ====================
  // Calcular precio
  // ====================
  const calculatePrice = async () => {
    try {
      const response = await bdMercado.post(`/calcular-precio/${productId}`, {
        cantidad: parseFloat(weight),
      });
      const { precio_total } = response.data;
      setPrice(precio_total);

      const kilos = Math.floor(weight);
      const gramos = (weight - kilos) * 1000;

      if (weight < 1) {
        setMessage(
          `Estás a punto de agregar ${gramos.toFixed(0)} gramos de ${productName}. Esto costará S/ ${precio_total.toFixed(2)}.`
        );
      } else {
        setMessage(
          `Estás a punto de agregar ${kilos} kilo${kilos !== 1 ? 's' : ''} con ${gramos.toFixed(
            0
          )} gramos de ${productName}. Esto costará S/ ${precio_total.toFixed(2)}.`
        );
      }
    } catch {
      setMessage('');
    }
  };

  // ====================
  // Agregar producto
  // ====================
  const handleAddWeight = async () => {
    if (!weight || parseFloat(weight) <= 0) {
      setMessage('⚠️ Ingrese un peso válido.');
      return;
    }

    const payload = {
      producto_id: productId,
      cantidad: parseFloat(weight),
    };

    try {
      if (user?.related_data) {
        // ➡️ Usuario logueado
        await bdMercado.post('/carrito/user/agregar', {
          ...payload,
          user_id: user.related_data.user_id,
        });
      } else {
        // ➡️ Invitado
        await bdMercado.post('/carrito/invitado/agregar', {
          ...payload,
          uuid: guestUuid,
        });
      }

      await refreshCartCount(true); // 🔥 Actualiza burbuja carrito
      toast.success('🛒 Producto agregado al carrito');
      setWeight('');
      setMessage('');
      onClose();
    } catch {
      setMessage('❌ Hubo un error al agregar el producto.');
    }
  };

  // ====================
  // Cerrar modal
  // ====================
  const handleCloseModal = (e) => {
    if (e.target.className === 'modal-overlay' || e.target.className === 'close-button') {
      setView('form');
      setWeight('');
      setMessage('');
      onClose();
    }
  };

  return (
    isOpen && (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="peso-modal-content">
          <button className="close-button" onClick={handleCloseModal}>
            X
          </button>
          {view === 'form' ? (
            <>
              <h2 className="modal-title">Ingresar Peso</h2>
              <input
                type="number"
                step="0.01"
                min="0.1"
                placeholder="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="modal-input"
              />
              <button className="modal-button" onClick={handleAddWeight}>
                Agregar al Carrito
              </button>
              {message && <p className="modal-message">{message}</p>}
            </>
          ) : (
            <div className="success-view">
              <div className="success-card">
                <div className="success-icon">🛒✅</div>
                <h3 className="success-text">¡Producto agregado!</h3>
                <p className="success-subtext">Tu producto fue añadido correctamente al carrito.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default PesoModal;
