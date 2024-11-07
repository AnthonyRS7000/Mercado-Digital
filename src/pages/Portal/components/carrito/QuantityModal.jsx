import React, { useState, useEffect } from 'react';
import '../peso/css/Modal.css';

const QuantityModal = ({ isOpen, onClose, product, onUpdateQuantity }) => {
  const [quantity, setQuantity] = useState(product.cantidad);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (quantity === '') setQuantity('');
    else {
      const kilos = Math.floor(quantity);
      const gramos = (quantity - kilos) * 1000;
      setMessage(`Vas a cambiar a ${kilos} kilo${kilos !== 1 ? 's' : ''} con ${gramos.toFixed(0)} gramos`);
    }
  }, [quantity]);

  const handleSave = () => {
    onUpdateQuantity(product.carrito_id, product.producto.id, quantity);  // Asegúrate de que estás pasando el ID del carrito y del producto
    onClose();
  };

  const handleCloseModal = (e) => {
    if (e.target.className === 'modal-overlay' || e.target.className === 'close-button') {
      onClose();
    }
  };

  return (
    isOpen && (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="modal-content">
          <button className="close-button" onClick={handleCloseModal}>X</button>
          <h2>Actualizar Cantidad</h2>
          <input
            type="number"
            step={product.producto.tipo === 'peso' ? "0.01" : "1"}
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="modal-input"
          />
          <button className="modal-button" onClick={handleSave}>
            Guardar
          </button>
          {message && <p className="modal-message">{message}</p>}
        </div>
      </div>
    )
  );
};

export default QuantityModal;
