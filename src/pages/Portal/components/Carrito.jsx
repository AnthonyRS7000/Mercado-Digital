// src/components/Carrito.jsx
import React, { useEffect, useState } from 'react';
import bdMercado from '../../../services/bdMercado';
import '../css/Carrito.css';

const Carrito = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);  // Estado de carga

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const uuid = localStorage.getItem('carrito_uuid');
        if (!uuid) {
          throw new Error('UUID no encontrado en el localStorage');
        }

        console.log('UUID from localStorage:', uuid);
        const response = await bdMercado.get(`/carrito?uuid=${uuid}`);
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);  // Finaliza la carga
      }
    };

    fetchCart();
  }, []);

  return (
    <div className="cart-container">
      <h2>Mi Carrito</h2>
      {loading ? (
        <p>Cargando...</p>  // Mensaje de carga
      ) : cartItems.length === 0 ? (
        <p>El carrito está vacío</p>
      ) : (
        <ul className="cart-items">
          {cartItems.map(item => (
            <li key={item.id} className="cart-item">
              <div className="item-info">
                <p className="item-name">{item.nombre}</p>
                <p className="item-quantity">Cantidad: {item.cantidad}</p>
                <p className="item-price">Precio: S/ {item.total}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Carrito;
