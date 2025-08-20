// src/components/PedidosDelivery.jsx
import React, { useEffect, useState } from "react";
import "../../../src/styles/css/pedidosDelivery.css";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../services/authService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bdMercado from "../../services/bdMercado";

const MAX_PRODUCTOS_MOSTRAR = 4;

const PedidosDelivery = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verMasProductos, setVerMasProductos] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const verificarPedidoActivo = async () => {
      try {
        const token = getToken();
        if (!token) throw new Error("No se encontró el token de usuario");

        const storedUser = localStorage.getItem("user");
        if (!storedUser) throw new Error("No se encontró el usuario en localStorage");
        const userData = JSON.parse(storedUser);
        const deliveryId = userData?.related_data?.id;
        if (!deliveryId) throw new Error("No se encontró el ID del delivery");

        const response = await bdMercado.get(`/delivery/pedido-activo/${deliveryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          validateStatus: (status) => status === 200 || status === 404,
        });

        if (response.status === 200 && response.data.pedido_id) {
          navigate(`/admin/recoger-pedido/${response.data.pedido_id}`);
        } else {
          await fetchPedidos();
        }
      } catch (err) {
        toast.error(`❌ ${err.message}`);
        await fetchPedidos();
      }
    };

    const fetchPedidos = async () => {
      try {
        const token = getToken();
        if (!token) throw new Error("No se encontró el token de usuario");

        const response = await bdMercado.get("/delivery/pedidos/pedidos-delivery", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          validateStatus: (status) => status === 200 || status === 404,
        });

        if (response.status === 404) {
          setPedidos([]);
        } else {
          setPedidos(response.data);
        }
      } catch (err) {
        setError(err.message);
        toast.error(`❌ ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    verificarPedidoActivo();
    // eslint-disable-next-line
  }, []);

  const handleAceptarPedido = async (pedidoId) => {
    try {
      const token = getToken();
      if (!token) throw new Error("No se encontró el token de usuario");

      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("No se encontró el usuario en localStorage");
      const userData = JSON.parse(storedUser);
      const deliveryId = userData?.related_data?.id;
      if (!deliveryId) throw new Error("No se encontró el ID del delivery");

      const response = await bdMercado.put(
        `/pedidos/aceptar/${pedidoId}`,
        { delivery_id: deliveryId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPedidoSeleccionado(response.data.pedido);
      toast.success("✅ Pedido aceptado correctamente");
      navigate(`/admin/recoger-pedido/${pedidoId}`);
    } catch (err) {
      console.error(err);
      toast.error("❌ Error al aceptar el pedido");
    }
  };

  const handleToggleVerMas = (pedidoId) => {
    setVerMasProductos((prev) => ({
      ...prev,
      [pedidoId]: !prev[pedidoId],
    }));
  };

  const renderProductos = (detalles, pedidoId) => {
    if (!detalles || detalles.length === 0) {
      return <p>No hay productos disponibles para este pedido.</p>;
    }
    const mostrarTodos = verMasProductos[pedidoId];
    const lista = mostrarTodos ? detalles : detalles.slice(0, MAX_PRODUCTOS_MOSTRAR);

    return (
      <>
        {lista.map((detalle) => (
          <div key={detalle.id}>
            <p>
              <strong>{detalle.producto.nombre}</strong> – {detalle.cantidad}{" "}
              {detalle.producto.tipo === "peso" ? "kg" : "uni"}
            </p>
          </div>
        ))}
        {detalles.length > MAX_PRODUCTOS_MOSTRAR && (
          <button
            className="btn-ver-mas"
            onClick={() => handleToggleVerMas(pedidoId)}
          >
            {mostrarTodos
              ? "Ver menos"
              : `Ver más (${detalles.length - MAX_PRODUCTOS_MOSTRAR})`}
          </button>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="spinner-container loadingContainer">
        <FontAwesomeIcon icon={faStore} spin size="3x" className="loadingIcon" />
        <p>Cargando pedidos de delivery…</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-center">{error}</p>;
  }

  return (
    <div className="pedidos-container">
      <h2 className="pedidos-title">
        {pedidoSeleccionado
          ? "Detalle del Pedido Aceptado"
          : "Pedidos Disponibles para Recoger"}
      </h2>

      {pedidoSeleccionado ? (
        <div className="pedido-detail">
          <h3>Pedido #{pedidoSeleccionado.id}</h3>
          <p>
            Dirección: <span>{pedidoSeleccionado.direccion_entrega}</span>
          </p>
          <p>
            Cliente:{" "}
            <span>
              {pedidoSeleccionado.comprador?.nombre ||
                pedidoSeleccionado.user?.name}
            </span>
          </p>
          <p>
            Total: <span>S/ {pedidoSeleccionado.total}</span>
          </p>
          <div className="productos-list">
            <h4>Productos:</h4>
            {renderProductos(
              pedidoSeleccionado.detalles_pedido,
              pedidoSeleccionado.id
            )}
          </div>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="no-pedidos-msg">
          <p>No hay pedidos disponibles en este momento.</p>
        </div>
      ) : (
        <div className="pedido-grid">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="pedido-card">
              <h3>Pedido #{pedido.id}</h3>
              <p>
                Dirección: <span>{pedido.direccion_entrega}</span>
              </p>
              <p>
                Cliente:{" "}
                <span>
                  {pedido.comprador?.nombre || pedido.user?.name || "–"}
                </span>
              </p>
              <p>
                Total: <span>S/ {pedido.total}</span>
              </p>
              <div className="productos-list">
                <h4>Productos:</h4>
                {renderProductos(pedido.detalles_pedido, pedido.id)}
              </div>
              <button
                onClick={() => handleAceptarPedido(pedido.id)}
                className="btn-aceptar"
              >
                Aceptar Pedido
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PedidosDelivery;
