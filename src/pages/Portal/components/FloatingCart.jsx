import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../css/FloatingCart.css';

const FloatingCart = ({ count = 0 }) => {
  const navigate = useNavigate();

  return (
    <div
      className="floating-cart"
      onClick={() => navigate('/carrito')}
      tabIndex={0}
      title="Ir al carrito"
    >
      <FaShoppingCart className="floating-cart-icon" />
      {/* Badge siempre visible */}
      <span className="floating-cart-badge">{count}</span>
    </div>
  );
};

export default FloatingCart;
