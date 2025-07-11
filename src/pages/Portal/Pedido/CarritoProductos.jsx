// src/pages/Portal/CarritoProductos.jsx
import React, { useContext, useEffect, useState } from 'react';
import bdMercado from '../../../services/bdMercado';
import { AuthContext } from '../../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import styles from '../Pedido/css/ConfirmarPedido.module.css';

const CarritoProductos = () => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userId = user.related_data.user_id;
        const response = await bdMercado.get(`/carrito/user/${userId}`);
        setCart(response.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    fetchCart();
  }, [user]);

  if (!cart) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.carritoProductosContainer}>
      <h3>Productos en el Carrito</h3>
      <table className={styles.cartTable}>
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cart.productos.map(({ id, cantidad, total, producto }) => (
            <tr key={id}>
              <td>
                <img src={`https://mercado-backend${producto.imagen}`} alt={producto.nombre} className={styles.productImage} />
              </td>
              <td>{producto.nombre}</td>
              <td>{producto.precio}</td>
              <td>{cantidad}</td>
              <td>{total}</td>
              <td>
                <button className={styles.removeButton}>
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CarritoProductos;
