// src/components/ConfirmarPedido.jsx
import React, { useEffect, useState } from 'react';
import bdMercado from '../../services/bdMercado';
import '../../styles/css/ConfirmarPedido.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ConfirmarPedido = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarProductos, setMostrarProductos] = useState({});

  useEffect(() => {
    const obtenerPedidos = async () => {
      try {
        const response = await bdMercado.get('/pedidos-por-confirmar');
        setPedidos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setPedidos([]);
        toast.error(`❌ Error al cargar pedidos: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    obtenerPedidos();
  }, []);

  const toggleProductos = (pedidoId) => {
    setMostrarProductos((prev) => ({
      ...prev,
      [pedidoId]: !prev[pedidoId],
    }));
  };

  const handleConfirmarPedido = async (pedidoId) => {
    try {
      await bdMercado.put(`/confirmar-pedido/${pedidoId}`, {});
      toast.success('✅ Pedido confirmado con éxito');
      setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
    } catch (err) {
      console.error(err);
      toast.error('❌ No se pudo confirmar el pedido');
    }
  };

  if (loading) {
    return (
      <div className="spinner-container loadingContainer">
        <FontAwesomeIcon
          icon={faStore}
          spin
          size="3x"
          className="loadingIcon"
        />
        <p>Cargando pedidos por confirmar…</p>
      </div>
    );
  }

  if (!Array.isArray(pedidos) || pedidos.length === 0) {
    return (
      <div className="confirmar-pedidos-container no-pedidos">
        <h2>📭 No hay pedidos pendientes por confirmar</h2>
        <p>Vuelve a revisar más tarde.</p>
      </div>
    );
  }

  return (
    <div className="confirmar-pedidos-container">
      <h2 className="confirmar-title">Pedidos por Confirmar</h2>
      <div className="pedidos-list">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="pedido-card">
            <div className="pedido-header">
              <h3>
                Pedido #{pedido.id}{' '}
                <span className="pedido-fecha">{pedido.fecha}</span>
              </h3>
              <button
                className="expand-btn"
                onClick={() => toggleProductos(pedido.id)}
              >
                {mostrarProductos[pedido.id]
                  ? 'Ocultar productos'
                  : 'Ver productos'}
              </button>
            </div>
            <p>
              <strong>Cliente:</strong> {pedido.comprador?.nombre}
            </p>
            <p>
              <strong>Dirección de entrega:</strong>{' '}
              {pedido.direccion_entrega}
            </p>
            <p>
              <strong>Total:</strong> S/ {pedido.total}
            </p>
            <button
              onClick={() => handleConfirmarPedido(pedido.id)}
              title="Confirmar pedido"
              className="btn-confirmar"
            >
              Confirmar
            </button>
            {mostrarProductos[pedido.id] && (
              <div className="productos-list">
                <h4>Productos:</h4>
                {pedido.detalles_pedido &&
                pedido.detalles_pedido.length > 0 ? (
                  <div className="productos-list-items-horizontal">
                    {pedido.detalles_pedido.map((detalle) => (
                      <div
                        key={detalle.id}
                        className="producto-card-horizontal"
                      >
                        <p>
                          <strong>{detalle.nombre_producto}</strong>
                        </p>
                        <p>Cantidad: {detalle.cantidad}</p>
                        <p>Precio: S/ {detalle.precio_unitario}</p>
                        {detalle.proveedor && (
                          <p className="proveedor">
                            <span>Proveedor: </span>
                            {detalle.proveedor.nombre}{' '}
                            <span>({detalle.proveedor.nombre_empresa})</span>
                          </p>
                        )}
                        {detalle.categoria && (
                          <p className="categoria">
                            <span>Categoría: </span>
                            {detalle.categoria.nombre}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No hay productos para este pedido</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfirmarPedido;
