import React, { useEffect, useState, useContext } from 'react';
import bdMercado from '../../../services/bdMercado';
import { AuthContext } from '../../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faTruck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import PedidoRapidoModal from './PedidoRapidoModal';
import PedidoProgramadoModal from './PedidoProgramadoModal'; 
import './css/Pedido.css';

const Pedido = () => {
  const { user, refreshCartCount } = useContext(AuthContext);

  const [cart, setCart] = useState({ productos: [] });
  const [isPedidoRapidoModalOpen, setPedidoRapidoModalOpen] = useState(false);
  const [isPedidoProgramadoModalOpen, setPedidoProgramadoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const userId = user.related_data.user_id;
      const response = await bdMercado.get(`/carrito/user/${userId}`);
      setCart(response.data);
      setIsLoading(false);
    } catch (error) {
      setCart({ productos: [] });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.related_data?.user_id) {
      fetchCart();
    }
    // eslint-disable-next-line
  }, [user]);

  // ------- Confirmación de Pedido Rápido -------
  const handleConfirmOrder = async (paymentMethod, address) => {
    try {
      // Crear pedido
      await bdMercado.post('/pedidos', {
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

      setPedidoRapidoModalOpen(false);

      // 🚨 Vaciar carrito SOLO en contraentrega
      if (paymentMethod === 1) {
        await bdMercado.post('/carrito/vaciar', {
          user_id: user.related_data.user_id,
        });
        await refreshCartCount(true);
        fetchCart();
      }
    } catch (error) {
      console.error('Error al confirmar pedido:', error.response?.data || error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <div className="alert alert-info" role="alert">
          <FontAwesomeIcon icon={faSpinner} spin /> <strong>Cargando tu carrito...</strong>
        </div>
      </div>
    );
  }

  if (!cart || !cart.productos || cart.productos.length === 0) {
    return (
      <div className="text-center mt-5">
        <div className="alert alert-info" role="alert">
          <strong>No tienes productos en el carrito.</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="pedido-container">
      <h2 className="titulo-pedido">Realizar Pedido</h2>
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
                <td>{cantidad} {producto.tipo === 'peso' ? 'Kg' : 'Ud.'}</td>
                <td>S/. {producto.precio}</td>
                <td>S/. {total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pedido-total">
          <p>Total precio: S/.{cart.total_precio}</p>
        </div>
      </div>
      <div className="pedido-opciones">
        <button
          className="btn-pedido btn-rapido"
          onClick={() => setPedidoRapidoModalOpen(true)}
        >
          <FontAwesomeIcon icon={faTruck} /> Pedido Rápido
        </button>

        <button
          className="btn-custom-vino"
          onClick={() => setPedidoProgramadoModalOpen(true)}
        >
          <FontAwesomeIcon icon={faClock} /> Pedido Programado
        </button>
      </div>

      <PedidoRapidoModal
        isOpen={isPedidoRapidoModalOpen}
        onClose={() => setPedidoRapidoModalOpen(false)}
        onConfirm={handleConfirmOrder}
      />

      <PedidoProgramadoModal
        isOpen={isPedidoProgramadoModalOpen}
        onClose={() => setPedidoProgramadoModalOpen(false)}
        cart={cart}
      />
    </div>
  );
};

export default Pedido;
