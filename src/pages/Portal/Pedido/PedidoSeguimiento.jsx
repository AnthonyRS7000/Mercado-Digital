import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faBoxOpen, faTruck, faCheckCircle } from '@fortawesome/free-solid-svg-icons'; // Cambiado faUtensils por faBoxOpen
import { AuthContext } from '../../../context/AuthContext';
import bdMercado from '../../../services/bdMercado';
import './css/PedidoSeguimiento.css';

const PedidoSeguimiento = () => {
  const { user } = useContext(AuthContext);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const userId = user.related_data.user_id;
        const response = await bdMercado.get(`/pedidos/${userId}`);
        setPedidos(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchPedidos();
  }, [user]);

  if (!pedidos.length) {
    return <div>Cargando...</div>;
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 1:
        return faClock;
      case 2:
        return faBoxOpen; // Icono de empaquetando
      case 3:
        return faTruck;
      case 4:
        return faCheckCircle;
      default:
        return faClock;
    }
  };

  const getEstadoText = (estado) => {
    switch (estado) {
      case 1:
        return 'Pendiente';
      case 2:
        return 'Empaquetando';
      case 3:
        return 'En Camino';
      case 4:
        return 'Entregado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="seguimiento-container">
      <h2>Seguimiento de Pedidos</h2>
      {pedidos.map((pedido) => (
        <div key={pedido.id} className="pedido-item">
          <div className="estado">
            <FontAwesomeIcon icon={getEstadoIcon(pedido.estado)} className="estado-icon" />
            <p className="estado-text">{getEstadoText(pedido.estado)}</p>
          </div>
          <p className="pedido-id">ID del Pedido: {pedido.id}</p>
          <p className="pedido-fecha">Fecha y Hora: {new Date(pedido.created_at).toLocaleString()}</p>
          <div className="productos">
            <h3>Productos:</h3>
            <ul>
              {pedido.detalles_pedido.map((detalle) => (
                <li key={detalle.id}>
                  <span className="producto-nombre">{detalle.producto.nombre}</span>
                  <span className="producto-cantidad">
                    {detalle.cantidad} {detalle.producto.tipo === 'peso' ? 'kg' : 'unidades'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="timeline">
            <div className={`timeline-step ${pedido.estado >= 1 ? 'completed' : ''}`}>
              <FontAwesomeIcon icon={faClock} className="timeline-icon" />
              <p>Pendiente</p>
            </div>
            <div className={`timeline-step ${pedido.estado >= 2 ? 'completed' : ''}`}>
              <FontAwesomeIcon icon={faBoxOpen} className="timeline-icon" />
              <p>Empaquetando</p>
            </div>
            <div className={`timeline-step ${pedido.estado >= 3 ? 'completed' : ''}`}>
              <FontAwesomeIcon icon={faTruck} className="timeline-icon" />
              <p>En Camino</p>
            </div>
            <div className={`timeline-step ${pedido.estado >= 4 ? 'completed' : ''}`}>
              <FontAwesomeIcon icon={faCheckCircle} className="timeline-icon" />
              <p>Entregado</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PedidoSeguimiento;
