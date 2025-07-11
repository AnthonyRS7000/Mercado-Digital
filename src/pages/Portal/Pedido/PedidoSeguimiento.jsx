import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faBoxOpen, faCheckCircle, faTruck, faBox } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../../context/AuthContext';
import bdMercado from '../../../services/bdMercado';
import LoginModal from '../LoginModal';
import './css/PedidoSeguimiento.css';
import { Spinner } from 'react-bootstrap';

const PedidoSeguimiento = () => {
  const { user } = useContext(AuthContext);
  const [pedidos, setPedidos] = useState([]);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!user) {
        setLoginModalOpen(true);
        setIsLoading(false);
        return;
      }

      try {
        const userId = user.related_data.user_id;
        const response = await bdMercado.get(`/pedidos/${userId}`);
        setPedidos(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPedidos();
  }, [user]);

  const normalizarEstado = (estado) => {
    if (estado === 10) return 3; // Listo
    if (estado === 20) return 4; // En Camino
    return estado;
  };

  const getEstadoIcon = (estado) => {
    const estadoNormal = normalizarEstado(estado);
    switch (estadoNormal) {
      case 1: return faClock;
      case 2: return faBoxOpen;
      case 3: return faBox;
      case 4: return faTruck;
      case 5: return faCheckCircle;
      default: return faClock;
    }
  };

  const getEstadoText = (estado) => {
    const estadoNormal = normalizarEstado(estado);
    switch (estadoNormal) {
      case 1: return 'Pendiente';
      case 2: return 'Empaquetando';
      case 3: return 'Listos';
      case 4: return 'En Camino';
      case 5: return 'Entregado';
      default: return 'Desconocido';
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border wine-spinner" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
        <p style={{ color: '#800000' }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="seguimiento-container">
      <h2 className="titulo-pedido">MIS PEDIDOS</h2>
      {pedidos.map((pedido) => {
        const estado = normalizarEstado(pedido.estado);
        return (
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
            <div className={`timeline step-${estado}`}>
              <div
                className="timeline-progress"
                style={{ width: `${(estado - 1) / 4 * 100}%` }}
              ></div>

              <div className={`timeline-step ${estado >= 1 ? 'completed' : ''}`}>
                <FontAwesomeIcon icon={faClock} className="timeline-icon" />
                <p>Pendiente</p>
              </div>
              <div className={`timeline-step ${estado >= 2 ? 'completed' : ''}`}>
                <FontAwesomeIcon icon={faBoxOpen} className="timeline-icon" />
                <p>Empaquetando</p>
              </div>
              <div className={`timeline-step ${estado >= 3 ? 'completed' : ''}`}>
                <FontAwesomeIcon icon={faBox} className="timeline-icon" />
                <p>Listos</p>
              </div>
              <div className={`timeline-step ${estado >= 4 ? 'completed' : ''}`}>
                <FontAwesomeIcon icon={faTruck} className="timeline-icon" />
                <p>En Camino</p>
              </div>
              <div className={`timeline-step ${estado >= 5 ? 'completed' : ''}`}>
                <FontAwesomeIcon icon={faCheckCircle} className="timeline-icon" />
                <p>Entregado</p>
              </div>
            </div>
          </div>
        );
      })}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </div>
  );
};

export default PedidoSeguimiento;
