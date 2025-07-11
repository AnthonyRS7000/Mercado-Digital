import { useToast } from '../../../../context/ToastContext';
import { useState, useEffect, useContext } from 'react';
import bdMercado from '../../../../services/bdMercado';
import './css/Modal.css';
import { AuthContext } from '../../../../context/AuthContext';

const UnidadModal = ({ isOpen, onClose, productId, productName }) => {
  const [cantidad, setCantidad] = useState(1);
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState(null);
  const [view, setView] = useState('form');
  const { addToast } = useToast();

  // Trae lo necesario del contexto
  const { user, guestUuid, refreshCartCount } = useContext(AuthContext);

  useEffect(() => {
    if (Number.isInteger(+cantidad) && parseInt(cantidad) > 0 && productId) {
      calculatePrice();
    } else {
      setMessage('⚠️ Solo se permiten cantidades enteras positivas.');
      setPrice(null);
    }
    // eslint-disable-next-line
  }, [cantidad, productId]);

  const calculatePrice = async () => {
    try {
      const response = await bdMercado.post(`/calcular-precio/${productId}`, {
        cantidad: parseInt(cantidad),
      });
      const { precio_total } = response.data;
      setPrice(precio_total);
      setMessage(`Estás a punto de agregar ${cantidad} unidad${cantidad !== 1 ? 'es' : ''} de ${productName}. Esto costará S/ ${precio_total.toFixed(2)}.`);
    } catch (error) {
      setMessage('');
    }
  };

  const handleAddUnidad = async () => {
    const cantidadEntera = parseInt(cantidad);
    if (!cantidad || isNaN(cantidadEntera) || cantidadEntera <= 0 || !Number.isInteger(+cantidad)) {
      setMessage('⚠️ Ingrese una cantidad válida (solo enteros).');
      return;
    }

    let payload = {
      producto_id: productId,
      cantidad: cantidadEntera,
    };

    if (user?.related_data) {
      payload.user_id = user.related_data.user_id;
    } else {
      payload.uuid = guestUuid; // Siempre usa el guestUuid del contexto
    }

    try {
      await bdMercado.post('/carrito/agregar', payload);
      await refreshCartCount(true); // 🔥 ACTUALIZA BURBUJA AL INSTANTE
      setView('success');
      addToast(`"${productName}" agregado al carrito 🛒`, 'success');
      setTimeout(() => {
        setView('form');
        setCantidad(1);
        setMessage('');
        onClose();
      }, 1500);
    } catch (error) {
      setMessage('❌ Hubo un error al agregar el producto.');
      addToast('Error al agregar el producto', 'error');
    }
  };

  const handleCloseModal = (e) => {
    if (e.target.className === 'modal-overlay' || e.target.className === 'close-button') {
      setView('form');
      setCantidad(1);
      setMessage('');
      onClose();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCantidad(value);
    }
  };

  return (
    isOpen && (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="peso-modal-content">
          <button className="close-button" onClick={handleCloseModal}>X</button>
          {view === 'form' ? (
            <>
              <h2 className="modal-title">Seleccionar Cantidad</h2>
              <input
                type="text"
                value={cantidad}
                onChange={handleInputChange}
                className="modal-input"
                placeholder="Solo enteros"
              />
              <button className="modal-button" onClick={handleAddUnidad}>
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

export default UnidadModal;
