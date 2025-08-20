import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import bdMercado from "../../services/bdMercado";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore, faBell } from "@fortawesome/free-solid-svg-icons";
import ModalConfirmacion from "./ModalConfirmacion";
import "../../styles/css/VerPedidos.css";

const VerPedidos = () => {
  const { user } = useContext(AuthContext);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPedido, setExpandedPedido] = useState(null);

  // Para controlar el modal de notificación
  const [notificarDetalle, setNotificarDetalle] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await bdMercado.get(
          `/proveedor/pedidos/${user.related_data.id}`
        );
        const ordenados = response.data.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        setPedidos(ordenados);
      } catch (e) {
        setError("No se pudieron cargar los pedidos");
      } finally {
        setLoading(false);
      }
    };
    if (user?.related_data?.id) fetchPedidos();
  }, [user]);

  const togglePedido = (id) =>
    setExpandedPedido(expandedPedido === id ? null : id);

  const confirmarNotificacion = async () => {
    if (!notificarDetalle) return;
    const { pedidoId, detalleId } = notificarDetalle;

    try {
      const resp = await bdMercado.put(
        `/pedidos/notificar-recolector/${pedidoId}`,
        {
          proveedor_id: user.related_data.id,
          producto_id: notificarDetalle.productoId,
        }
      );
      // Abrir WhatsApp si viene link
      if (resp.data.link_whatsapp) {
        window.open(resp.data.link_whatsapp, "_blank");
      }

      // Eliminar el detalle de la lista al instante
      setPedidos(prev =>
        prev
          .map(pedido =>
            pedido.id === pedidoId
              ? {
                  ...pedido,
                  detalles_pedido: pedido.detalles_pedido.filter(
                    d => d.id !== detalleId
                  ),
                }
              : pedido
          )
          .filter(pedido => pedido.detalles_pedido.length > 0)
      );
    } catch (err) {
      alert("Hubo un error al notificar al recolector");
    } finally {
      setNotificarDetalle(null);
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
        <p>Cargando pedidos…</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-center">{error}</p>;
  }

  if (pedidos.length === 0) {
    return <p className="text-gray-700 text-center">No tienes pedidos vendidos.</p>;
  }

  return (
    <div className="ver-pedidos-container">
      <h2 className="ver-pedidos-title">Mis Pedidos Vendidos</h2>
      <div className="pedidos-list">
        {pedidos.map((pedido) => {
          const total = pedido.detalles_pedido.reduce(
            (sum, d) => sum + parseFloat(d.subtotal),
            0
          );
          return (
            <div key={pedido.id} className="pedido-card">
              <div className="pedido-header">
                <h3>Pedido #{pedido.id}</h3>
                <button
                  className="expand-btn"
                  onClick={() => togglePedido(pedido.id)}
                >
                  {expandedPedido === pedido.id
                    ? "Ocultar productos"
                    : "Ver productos"}
                </button>
              </div>

              {expandedPedido === pedido.id && (
                <div className="productos-list">
                  <div className="productos-list-items-horizontal">
                    {pedido.detalles_pedido.map((detalle) => (
                      <div
                        key={detalle.id}
                        className="producto-card-horizontal"
                      >
                        <p>
                          <strong>Producto:</strong>{" "}
                          {detalle.producto.nombre}
                        </p>
                        <p>
                          <strong>Cantidad:</strong>{" "}
                          {parseFloat(detalle.cantidad).toFixed(2)}{" "}
                          {detalle.producto.tipo === "peso" ? "kg" : "unid"}
                        </p>
                        <p>
                          <strong>Subtotal:</strong> S/{" "}
                          {parseFloat(detalle.subtotal).toFixed(2)}
                        </p>
                        <button
                          className="notify-btn"
                          onClick={() =>
                            setNotificarDetalle({
                              pedidoId: pedido.id,
                              detalleId: detalle.id,
                              productoId: detalle.producto.id,
                              productoNombre: detalle.producto.nombre,
                            })
                          }
                          title="Notificar al recolector"
                        >
                          <FontAwesomeIcon icon={faBell} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pedido-total">
                    <strong>Total vendido:</strong> S/ {total.toFixed(2)}
                  </div>
                  <div className="pedido-cliente">
                    <strong>Cliente:</strong> {pedido.user?.name || "—"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ModalConfirmacion
        open={!!notificarDetalle}
        titulo="¿Notificar al recolector?"
        mensaje={
          <>
            Vas a notificar al recolector para el producto<br/>
            <strong>{notificarDetalle?.productoNombre}</strong>.<br/>
            ¿Deseas continuar?
          </>
        }
        confirmText="Sí, notificar"
        cancelText="Cancelar"
        onConfirm={confirmarNotificacion}
        onCancel={() => setNotificarDetalle(null)}
      />
    </div>
  );
};

export default VerPedidos;