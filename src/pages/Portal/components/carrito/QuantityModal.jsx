import React, { useState, useEffect } from 'react';
import styles from './QuantityModal.module.css'; // Usa un CSS modular o reemplaza por el tuyo

const QuantityModal = ({ isOpen, onClose, product, onUpdateQuantity }) => {
  // Admite producto.tipo, producto.cantidad, producto.carritoId, producto.id
  const [quantity, setQuantity] = useState(product?.cantidad || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setQuantity(product?.cantidad || '');
  }, [isOpen, product]);

  useEffect(() => {
    if (product?.tipo === 'peso' && quantity !== '') {
      const kilos = Math.floor(quantity);
      const gramos = ((quantity - kilos) * 1000).toFixed(0);
      setMessage(`Vas a cambiar a ${kilos} kilo${kilos !== 1 ? 's' : ''} con ${gramos} gramos`);
    } else {
      setMessage('');
    }
  }, [quantity, product]);

  const handleSave = () => {
    if (quantity === '' || Number(quantity) <= 0) return;
    onUpdateQuantity(product.carritoId, product.id, Number(quantity));
    onClose();
  };

  const handleCloseModal = (e) => {
    if (e.target.className?.includes('modalOverlay') || e.target.className?.includes('closeBtn')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleCloseModal}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        <h2>Actualizar Cantidad</h2>
        <input
          type="number"
          step={product?.tipo === 'peso' ? "0.01" : "1"}
          min="0.01"
          value={quantity}
          autoFocus
          onChange={e => setQuantity(e.target.value)}
          className={styles.modalInput}
        />
        <button className={styles.modalButton} onClick={handleSave}>
          Guardar
        </button>
        {message && <p className={styles.modalMessage}>{message}</p>}
      </div>
    </div>
  );
};

export default QuantityModal;
