import React, { useEffect, useState } from 'react';
import bdMercado from '../../services/bdMercado';
import '../../styles/css/ConfirmarPedido.css';
import { FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';

const ConfirmarPedido = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarProductos, setMostrarProductos] = useState({});

  useEffect(() => {
    const obtenerPedidos = async () => {
      try {
        const response = await bdMercado.get('/pedidos-por-confirmar');
        if (Array.isArray(response.data)) {
          setPedidos(response.data);
        } else {
          setPedidos([]);
        }
      } catch (error) {
        console.error('Error al obtener pedidos:', error);
        setPedidos([]); // Para evitar errores si falla
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

  if (loading) return <p className="cargando">Cargando pedidos...</p>;

  if (!Array.isArray(pedidos) || pedidos.length === 0) {
    return (
      <div className="container no-pedidos">
        <h2>📭 No hay pedidos pendientes por confirmar</h2>
        <p>Vuelve a revisar más tarde.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Pedidos por Confirmar</h2>
      {pedidos.map((pedido) => (
        <div key={pedido.id} className="card">
          <h3>
            Pedido #{pedido.id} - {pedido.fecha}
            <button onClick={() => toggleProductos(pedido.id)} style={{ marginLeft: '10px' }}>
              {mostrarProductos[pedido.id] ? '🙈 Ocultar' : '👁️ Ver productos'}
            </button>
          </h3>
          <p><strong>Cliente:</strong> {pedido.comprador?.nombre}</p>
          <p><strong>Dirección de entrega:</strong> {pedido.direccion_entrega}</p>
          <p><strong>Total:</strong> S/ {pedido.total}</p>
          <button
            onClick={async () => {
              try {
                await axios.put(`https://mercado-backend/api/confirmar-pedido/${pedido.id}`, {}, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                });

                alert('✅ Pedido confirmado con éxito');
                setPedidos(prev => prev.filter(p => p.id !== pedido.id));
              } catch (err) {
                console.error('Error al confirmar pedido', err);
                alert('❌ No se pudo confirmar el pedido');
              }
            }}
            title="Confirmar pedido"
            style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px', color: 'green' }}
          >
            <FaCheckCircle size={20} />
          </button>

          {mostrarProductos[pedido.id] && (
            <>
              <h4>Productos:</h4>
              <ul>
                {pedido.detalles_pedido.map((detalle) => (
                  <li key={detalle.id}>
                    <strong>{detalle.nombre_producto}</strong> - {detalle.cantidad} x S/ {detalle.precio_unitario} <br />
                    <small>Proveedor: {detalle.proveedor?.nombre} ({detalle.proveedor?.nombre_empresa})</small><br />
                    <small>Categoría: {detalle.categoria?.nombre}</small>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConfirmarPedido;
