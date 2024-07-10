import React, { useState, useEffect } from 'react';
import bdMercado from '../../../../services/bdMercado';
import './css/Modal.css';

const PesoModal = ({ isOpen, onClose, productId, productName, productPrice }) => {
  const [weight, setWeight] = useState('');
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState(null);

  useEffect(() => {
    if (weight && productId) {
      calculatePrice();
    }
  }, [weight, productId]);

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
        setMessage(`Estás a punto de agregar ${gramos.toFixed(0)} gramos de ${productName} a tu carrito. Esto costará S/ ${precio_total.toFixed(2)}.`);
      } else {
        setMessage(`Estás a punto de agregar ${kilos} kilo${kilos !== 1 ? 's' : ''} con ${gramos.toFixed(0)} gramos de ${productName} a tu carrito. Esto costará S/ ${precio_total.toFixed(2)}.`);
      }
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  const handleAddWeight = async () => {
    try {
      const uuid = localStorage.getItem('carrito_uuid');
      const response = await bdMercado.post('/carrito/agregar', {
        producto_id: productId,
        cantidad: parseFloat(weight),
        uuid: uuid,
      });
      console.log('Product added to cart:', response.data);
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
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
          <h2>Ingresar Peso</h2>
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
        </div>
      </div>
    )
  );
};

export default PesoModal;
