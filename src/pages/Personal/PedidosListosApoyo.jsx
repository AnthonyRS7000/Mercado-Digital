// src/components/PedidosListosApoyo.jsx
import React, { useEffect, useState } from "react";
import "../../../src/styles/css/PedidosListosApoyo.css";
import { getToken } from "../../services/authService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bdMercado from "../../services/bdMercado";

const PedidosListosApoyo = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      setError(null);
      try {
        const userToken = getToken();
        if (!userToken) {
          throw new Error("No se encontró el token de usuario");
        }

        const response = await bdMercado.get("apoyo/pedidos/listos", {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        let raw = response.data;
        let pedidosArray = [];

        if (raw.message) {
          // Cuando el backend sólo devuelve un mensaje
          pedidosArray = [];
        } else if (Array.isArray(raw)) {
          // Cuando el backend ya devuelve la lista directamente
          pedidosArray = raw;
        } else {
          // Cuando el backend devuelve un objeto agrupado { "1": [...], ... }
          pedidosArray = Object.entries(raw).map(([pedidoId, detalles]) => ({
            id: Number(pedidoId),
            direccion_entrega: detalles[0]?.pedido?.direccion_entrega || "",
            total:
              detalles[0]?.pedido?.total ??
              detalles.reduce((sum, d) => sum + d.cantidad * d.precio_unitario, 0),
            detalles_pedido: detalles,
          }));
        }

        // Filtrar solo los pedidos creados HOY
        const hoy = new Date();
        pedidosArray = pedidosArray.filter((p) => {
          if (!p.detalles_pedido?.length) return false;
          const created = new Date(p.detalles_pedido[0].created_at);
          return (
            created.getDate() === hoy.getDate() &&
            created.getMonth() === hoy.getMonth() &&
            created.getFullYear() === hoy.getFullYear()
          );
        });

        setPedidos(pedidosArray);
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        setError(msg);
        toast.error(`❌ ${msg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  const handleAceptarPedido = async (id, detallesPedido = []) => {
    try {
      const todosListos = detallesPedido.every(
        (detalle) => detalle.cantidad > 0
      );
      if (!todosListos) {
        toast.warn("⚠️ No todos los productos están listos para ser enviados.");
        return;
      }

      const userToken = getToken();
      if (!userToken) {
        throw new Error("No se encontró el token de usuario");
      }

      const storedData = localStorage.getItem("user");
      if (!storedData) {
        throw new Error("No se encontró el objeto 'user' en el almacenamiento local.");
      }
      const userData = JSON.parse(storedData);
      if (!userData?.related_data) {
        throw new Error("Usuario no encontrado o sin datos relacionados");
      }
      const recolectorId = userData.related_data.id;

      await bdMercado.put(
        `/pedidos/llamardelivery/${id}`,
        { personal_sistema_id: recolectorId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      setPedidos((prev) => prev.filter((pedido) => pedido.id !== id));
      toast.success("✅ El pedido ha sido marcado para delivery");
    } catch (err) {
      console.error(err);
      toast.error("❌ Hubo un error al enviar el pedido a delivery");
    }
  };

  if (loading) {
    return (
      <div className="spinner-container loadingContainer">
        <FontAwesomeIcon icon={faStore} spin size="3x" className="loadingIcon" />
        <p>Cargando pedidos listos…</p>
      </div>
    );
  }

  return (
    <div className="pedidos-container">
      <h2 className="pedidos-title">Pedidos Listos</h2>

      {error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : pedidos.length === 0 ? (
        <p className="text-gray-700 text-center">No hay pedidos listos</p>
      ) : (
        <div className="pedido-list-vertical">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="pedido-card-vertical">
              <h3>Pedido #{pedido.id}</h3>
              <p>
                Dirección:
                <br />
                <span>{pedido.direccion_entrega}</span>
              </p>
              <p>
                Total: <span>S/ {pedido.total}</span>
              </p>

              <div className="productos-list">
                <h4>Productos:</h4>
                {pedido.detalles_pedido.length > 0 ? (
                  <div className="productos-list-items-horizontal">
                    {pedido.detalles_pedido.map((detalle) => (
                      <div key={detalle.id} className="producto-item-horizontal">
                        <p>
                          <strong>Producto:</strong> {detalle.producto.nombre}
                        </p>
                        <p>
                          <strong>Cantidad:</strong> {detalle.cantidad}
                          {detalle.producto.tipo === "peso" ? "kg" : "uni"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No hay productos para este pedido</p>
                )}
              </div>

              <button
                onClick={() =>
                  handleAceptarPedido(pedido.id, pedido.detalles_pedido)
                }
                className="btn-aceptar"
              >
                Enviar a Delivery
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PedidosListosApoyo;
