// src/components/AlistarPedido.jsx
import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import bdMercado from "../../services/bdMercado";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore } from "@fortawesome/free-solid-svg-icons";
import "../../styles/css/AlistarPedido.css";

const AlistarPedido = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPedido, setExpandedPedido] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const userToken = getToken();
        if (!userToken) throw new Error("No se encontró el token de usuario");
        const response = await bdMercado.get("/apoyo/pedidos/notificados", {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        const data = response.data;

        const pedidosAgrupados = Object.keys(data).map((pedido_id) => {
          const productosVisibles = data[pedido_id].filter(
            (p) => p.notificado_proveedor !== 2
          );
          return { pedido_id, productos: productosVisibles };
        });

        setPedidos(pedidosAgrupados);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  const handleNotificarProveedor = async (pedidoId, productoId) => {
    try {
      const userToken = getToken();
      const stored = localStorage.getItem("user");
      if (!stored) throw new Error("No se encontró el usuario en localStorage");
      const { related_data } = JSON.parse(stored);

      await bdMercado.put(
        `/pedidos/marcar-listo/${pedidoId}`,
        { producto_id: productoId, recolector_id: related_data.id },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      setPedidos(prev =>
        prev
          .map(p =>
            p.pedido_id === pedidoId
              ? {
                  ...p,
                  // 👇 se corrige para usar producto_id (no producto.id)
                  productos: p.productos.filter(x => x.producto_id !== productoId)
                }
              : p
          )
          .filter(p => p.productos.length > 0)
      );
    } catch {
      alert("Hubo un error al marcar como listo");
    }
  };

  const togglePedidoExpand = (id) =>
    setExpandedPedido(expandedPedido === id ? null : id);

  if (loading) {
    return (
      <div className="spinner-container loadingContainer">
        <FontAwesomeIcon icon={faStore} spin size="3x" className="loadingIcon" />
        <p>Cargando pedidos…</p>
      </div>
    );
  }

  return (
    <div className="alistar-pedido-container">
      <h2 className="alistar-pedido-title">Pedidos Notificados</h2>
      {error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : pedidos.length === 0 ? (
        <p className="text-gray-700 text-center">No hay pedidos notificados</p>
      ) : (
        <div className="pedidos-list">
          {pedidos.map(p => (
            <div key={p.pedido_id} className="pedido-card">
              <div className="pedido-header">
                <h3>Pedido ID: {p.pedido_id}</h3>
                <button
                  className="expand-btn"
                  onClick={() => togglePedidoExpand(p.pedido_id)}
                >
                  {expandedPedido === p.pedido_id ? "Ocultar productos" : "Ver productos"}
                </button>
              </div>
              {expandedPedido === p.pedido_id && (
                <div className="productos-list">
                  {p.productos.length > 0 ? (
                    <div className="productos-list-items-horizontal">
                      {p.productos.map(prod => (
                        <div key={prod.id} className="producto-card-horizontal">
                          <p><strong>Producto:</strong> {prod.producto.nombre}</p>
                          <p><strong>Proveedor:</strong> {prod.producto.proveedor.nombre}</p>
                          <p><strong>Bodega:</strong> {prod.producto.proveedor.nombre_empresa}</p>
                          <p><strong>Cantidad:</strong> {prod.cantidad} {prod.producto.tipo === 'peso' ? 'kg' : 'uni'}</p>
                          <p><strong>Total:</strong> S/ {parseFloat(prod.subtotal).toFixed(2)}</p>
                          {prod.notificado_proveedor === 0 ? (
                            <button className="notificar-btn pending" disabled>
                              Falta alistar
                            </button>
                          ) : prod.notificado_proveedor === 1 ? (
                            <button
                              onClick={() =>
                                handleNotificarProveedor(p.pedido_id, prod.producto_id) // ✅ ahora sí
                              }
                              className="notificar-btn recoger"
                            >
                              Recoger
                            </button>

                          ) : null}
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
      )}
    </div>
  );
};

export default AlistarPedido;
