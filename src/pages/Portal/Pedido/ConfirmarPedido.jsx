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
      const pedidoData = {
        tipo: pedidoTipo,
        direccion,
        ...(pedidoTipo === 'programado' && { fecha, hora }),
      };
      const response = await bdMercado.post(`/pedidos/${user.related_data.user_id}`, pedidoData);
      console.log('Pedido realizado:', response.data);
      alert('Pedido realizado con éxito');
    } catch (error) {
      console.error('Error realizando el pedido:', error);
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
