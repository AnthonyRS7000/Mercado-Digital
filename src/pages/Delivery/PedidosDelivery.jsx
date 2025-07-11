import "../../../src/styles/css/pedidosDelivery.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../services/authService";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const PedidosDelivery = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarPedidoActivo = async () => {
      try {
        const token = getToken();
        const storedUser = localStorage.getItem("user");
        const userData = JSON.parse(storedUser);
        const deliveryId = userData?.related_data?.id;

        const response = await fetch(`http://127.0.0.1:8000/api/delivery/pedido-activo/${deliveryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.pedido_id) {
          navigate(`/admin/recoger-pedido/${data.pedido_id}`);
        } else {
          fetchPedidos();
        }
      } catch (error) {
        console.error("Error al verificar pedido activo:", error);
        fetchPedidos();
      }
    };

const fetchPedidos = async () => {
  try {
    const token = getToken();
    const response = await fetch("http://127.0.0.1:8000/api/pedidos/pedidos-delivery", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.status === 404) {
      // No hay pedidos, pero no es un error del sistema
      setPedidos([]); // Asegúrate de que esté vacío
    } else if (!response.ok) {
      throw new Error(data.message || `Error HTTP: ${response.status}`);
    } else {
      setPedidos(data);
    }
  } catch (err) {
    setError(err.message);
    console.error("Error al cargar pedidos:", err);
  } finally {
    setLoading(false);
  }
};

    verificarPedidoActivo();
  }, []);

  const handleAceptarPedido = async (pedidoId) => {
    try {
      const token = getToken();
      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("No se encontró el usuario en localStorage");

      const userData = JSON.parse(storedUser);
      const deliveryId = userData?.related_data?.id;
      if (!deliveryId) throw new Error("No se encontró el ID del delivery");

      const response = await fetch(`http://127.0.0.1:8000/api/pedidos/aceptar/${pedidoId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ delivery_id: deliveryId }),
      });

      if (!response.ok) throw new Error("No se pudo aceptar el pedido");

      const data = await response.json();
      setPedidoSeleccionado(data.pedido);
      navigate(`/admin/recoger-pedido/${pedidoId}`);
    } catch (err) {
      console.error("Error al aceptar el pedido:", err);
      alert("Error al aceptar el pedido.");
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <AiOutlineLoading3Quarters className="loading-icon" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-center">{error}</p>;
  }

  return (
    <div className="pedidos-container">
      <h2 className="pedidos-title">
        {pedidoSeleccionado ? "Detalle del Pedido Aceptado" : "Pedidos Disponibles para Recoger"}
      </h2>

      {pedidoSeleccionado ? (
        <div className="pedido-detail">
          <h3>Pedido #{pedidoSeleccionado.id}</h3>
          <p>Dirección: <span>{pedidoSeleccionado.direccion_entrega}</span></p>
          <p>Cliente: <span>{pedidoSeleccionado.user?.name}</span></p>
          <p>Total: <span>S/ {pedidoSeleccionado.total}</span></p>

          <div className="productos-list">
            <h4>Productos:</h4>
            {pedidoSeleccionado.detalles_pedido?.length > 0 ? (
              pedidoSeleccionado.detalles_pedido.map((detalle) => (
                <div key={detalle.id}>
                  <p><strong>{detalle.producto.nombre}</strong> - {detalle.cantidad} {detalle.producto.tipo === 'peso' ? 'kg' : 'uni'}</p>
                </div>
              ))
            ) : (
              <p>No hay productos disponibles para este pedido.</p>
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
              <p>Dirección: <span>{pedido.direccion_entrega}</span></p>
              <p>Cliente: <span>{pedido.user?.name}</span></p>
              <p>Total: <span>S/ {pedido.total}</span></p>

              <div className="productos-list">
                <h4>Productos:</h4>
                {pedido.detalles_pedido.map((detalle) => (
                  <div key={detalle.id}>
                    <p><strong>{detalle.producto.nombre}</strong> - {detalle.cantidad} {detalle.producto.tipo === 'peso' ? 'kg' : 'uni'}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => handleAceptarPedido(pedido.id)} className="btn-aceptar">
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
