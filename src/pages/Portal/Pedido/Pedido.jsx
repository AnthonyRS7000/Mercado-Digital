import React, { useEffect, useState, useContext } from 'react';
import bdMercado from '../../../services/bdMercado';
import { AuthContext } from '../../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faTruck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import PedidoRapidoModal from './PedidoRapidoModal';
import PedidoProgramadoModal from './PedidoProgramadoModal'; 
import './css/Pedido.css';

const Pedido = () => {
  const { user } = useContext(AuthContext);
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
      console.error('Error fetching cart:', error);
      setCart({ productos: [] });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.related_data?.user_id) {
      fetchCart();
    }
  }, [user]);

  const handleConfirmOrder = async (paymentMethod, address) => {
    try {
      console.log(`Confirmando pedido para el usuario: ${user.related_data.user_id}`);
      
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
      
      // Vaciar el carrito después de realizar el pedido
      const emptyCart = await bdMercado.delete(`/carrito/vaciar/${user.related_data.user_id}`);
      console.log('Respuesta al vaciar carrito:', emptyCart.data);
      
      // Actualizar el estado del carrito
      fetchCart();
    } catch (error) {
      console.error('Error realizando pedido:', error);
    }
  };

// Corrección en Pedido.jsx
const handleConfirmProgramado = async (data) => {
  try {
    console.log(`Confirmando pedido programado para el usuario: ${user.related_data.user_id}`);
    
    // Desestructurar correctamente los datos recibidos del modal
    const { fechaEntrega, horaEntrega, paymentMethod, address } = data;
    
    const response = await bdMercado.post('/pedidos', {
      fecha: new Date().toISOString().split('T')[0],
      estado: 1,
      direccion_entrega: address,        // Campo requerido que faltaba
      user_id: user.related_data.user_id,
      metodo_pago_id: paymentMethod,     // Campo requerido que faltaba
      fecha_programada: fechaEntrega,
      hora_programada: horaEntrega,
      productos: cart.productos.map((p) => ({
        producto_id: p.producto.id,
        cantidad: p.cantidad,
      })),
    });

    console.log('Pedido programado realizado:', response.data);
    setPedidoProgramadoModalOpen(false);
    
    // Vaciar el carrito después de realizar el pedido
    const emptyCart = await bdMercado.delete(`/carrito/vaciar/${user.related_data.user_id}`);
    console.log('Respuesta al vaciar carrito:', emptyCart.data);
    
    // Actualizar el estado del carrito
    fetchCart();
  } catch (error) {
    console.error('Error realizando pedido programado:', error);
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
        onConfirm={handleConfirmProgramado}
      />
    </div>
  );
};

export default Pedido;