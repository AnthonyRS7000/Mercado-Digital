import React, { useEffect, useState, useContext } from 'react';
import bdMercado from '../../../services/bdMercado';
import { AuthContext } from '../../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faTruck } from '@fortawesome/free-solid-svg-icons';
import PedidoRapidoModal from './PedidoRapidoModal';
import './css/Pedido.css';

const Pedido = () => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [isPedidoRapidoModalOpen, setPedidoRapidoModalOpen] = useState(false);

  const fetchCart = async () => {
    try {
      const userId = user.related_data.user_id;
      const response = await bdMercado.get(`/carrito/user/${userId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ productos: [] });
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const handleConfirmOrder = async (paymentMethod, address) => {
    try {
      const response = await bdMercado.post('/pedidos', {
        fecha: new Date().toISOString().split('T')[0],
        estado: 1,
        direccion_entrega: address,
        user_id: user.related_data.user_id,
        metodo_pago_id: paymentMethod,
        productos: cart.productos.map((p) => ({
          producto_id: p.producto.id,
          cantidad: p.cantidad,
        })),
      });

      console.log('Pedido realizado:', response.data);
      setPedidoRapidoModalOpen(false);
    } catch (error) {
      console.error('Error realizando pedido:', error);
    }
  };

  if (!cart) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="pedido-container">
      <h2>Realizar Pedido</h2>
      <div className="pedido-detalles">
        <h3>Detalles del Carrito</h3>
        <table className="pedido-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {cart.productos.map(({ id, cantidad, total, producto }) => (
              <tr key={id}>
                <td>{producto.nombre}</td>
                <td>{cantidad}</td>
                <td>{producto.precio}</td>
                <td>{total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pedido-total">
          <p>Total en kilos: {cart.cantidad_total} {cart.cantidad_total > 1 ? 'kilogramos' : 'unidad'}</p>
          <p>Total precio: {cart.total_precio}</p>
        </div>
      </div>
      <div className="pedido-opciones">
        <button className="btn pedido-rapido" onClick={() => setPedidoRapidoModalOpen(true)}>
          <FontAwesomeIcon icon={faTruck} /> Pedido Rápido
        </button>
        <button className="btn pedido-programado">
          <FontAwesomeIcon icon={faClock} /> Pedido Programado
        </button>
      </div>
      <PedidoRapidoModal
        isOpen={isPedidoRapidoModalOpen}
        onClose={() => setPedidoRapidoModalOpen(false)}
        onConfirm={handleConfirmOrder}
      />
    </div>
  );
};

export default Pedido;
