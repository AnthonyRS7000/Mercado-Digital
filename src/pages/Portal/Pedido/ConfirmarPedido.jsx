// src/pages/Portal/ConfirmarPedido.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import bdMercado from '../../../services/bdMercado';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faShippingFast } from '@fortawesome/free-solid-svg-icons';
import CarritoProductos from './CarritoProductos';
import styles from './css/ConfirmarPedido.module.css';

const ConfirmarPedido = () => {
  const { user } = useContext(AuthContext);
  const [pedidoTipo, setPedidoTipo] = useState('rapido'); // 'rapido' o 'programado'
  const [direccion, setDireccion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  const handlePedido = async () => {
    try {
      // Crear los datos del pedido
      const pedidoData = {
        tipo: pedidoTipo,
        direccion,
        ...(pedidoTipo === 'programado' && { fecha, hora }),
      };
  
      // Realizar el pedido
      const response = await bdMercado.post(`/pedidos/${user.related_data.user_id}`, pedidoData);
      console.log('Pedido realizado:', response.data);
  
      // Log para depurar: Verificar el user_id y la llamada a vaciar carrito
      console.log('ID del usuario que está haciendo el pedido:', user.related_data.user_id);
  
      // Verificación de la URL para vaciar el carrito
      const vaciarCarritoUrl = '/carrito/vaciar';
      console.log('Enviando solicitud a la URL de vaciar carrito:', vaciarCarritoUrl);
  
      // Vaciar el carrito después de realizar el pedido
      const vaciarCarritoResponse = await bdMercado.post(vaciarCarritoUrl, { user_id: user.related_data.user_id });
  
      // Log para depurar: Verificar la respuesta de vaciar carrito
      console.log('Respuesta de la API de vaciar carrito:', vaciarCarritoResponse);
  
      // Verificar la respuesta para vaciar el carrito
      if (vaciarCarritoResponse.status === 200) {
        console.log('Carrito vacío:', vaciarCarritoResponse.data);
      } else {
        console.error('Error vaciando el carrito:', vaciarCarritoResponse.data);
      }
  
      // Alerta de éxito
      alert('Pedido realizado con éxito');
    } catch (error) {
      console.error('Error realizando el pedido o vaciando el carrito:', error);
      alert('Hubo un error al realizar el pedido');
    }
  };
  
   
  return (
    <div className={styles.confirmarPedidoContainer}>
      <h2>Confirmar Pedido</h2>
      <CarritoProductos />
      <div className={styles.pedidoTipoContainer}>
        <button
          className={`${styles.pedidoTipoButton} ${pedidoTipo === 'rapido' ? styles.active : ''}`}
          onClick={() => setPedidoTipo('rapido')}
        >
          <FontAwesomeIcon icon={faShippingFast} /> Pedido Rápido
        </button>
        <button
          className={`${styles.pedidoTipoButton} ${pedidoTipo === 'programado' ? styles.active : ''}`}
          onClick={() => setPedidoTipo('programado')}
        >
          <FontAwesomeIcon icon={faClock} /> Pedido Programado
        </button>
      </div>
      <div className={styles.pedidoForm}>
        <label>
          Dirección de entrega:
          <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
        </label>
        {pedidoTipo === 'programado' && (
          <>
            <label>
              Fecha de entrega:
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </label>
            <label>
              Hora de entrega:
              <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
            </label>
          </>
        )}
        <button className={styles.confirmarButton} onClick={handlePedido}>
          Confirmar Pedido
        </button>
      </div>
    </div>
  );
};

export default ConfirmarPedido;
