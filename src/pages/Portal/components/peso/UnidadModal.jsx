import { useState, useEffect, useContext } from 'react';
import bdMercado from '../../../../services/bdMercado';
import './css/Modal.css';
import { AuthContext } from '../../../../context/AuthContext';
import { toast } from 'react-toastify';

const UnidadModal = ({ isOpen, onClose, productId, productName }) => {
  const [cantidad, setCantidad] = useState(1);
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState(null);
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

    const payload = {
      producto_id: productId,
      cantidad: cantidadEntera,
      ...(user?.related_data ? { user_id: user.related_data.user_id } : { uuid: guestUuid })
    };

    try {
      await bdMercado.post('/carrito/agregar', payload);
      await refreshCartCount(true);
      toast.success('🛒 Producto agregado al carrito');
      setCantidad(1);
      setMessage('');
      onClose();
    } catch (error) {
      toast.error('❌ Hubo un error al agregar el producto.');
    }
  };

  const handleCloseModal = (e) => {
    if (e.target.className === 'modal-overlay' || e.target.className === 'close-button') {
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
        </div>
      </div>
    )
  );
};

export default UnidadModal;
