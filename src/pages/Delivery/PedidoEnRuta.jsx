// src/components/PedidoEnRuta.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken } from "../../services/authService";
import bdMercado from "../../services/bdMercado";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import "../../../src/styles/css/PedidoEnRuta.css";
import ModalEntrega from "./ModalEntrega";

const PedidoEnRuta = () => {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estadoPedido, setEstadoPedido] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const token = getToken();
        if (!token) throw new Error("No se encontró el token de usuario");

        const storedUser = localStorage.getItem("user");
        if (!storedUser) throw new Error("No se encontró el usuario en localStorage");
        const parsedUser = JSON.parse(storedUser);

        const deliveryId = parsedUser?.related_data?.id;
        if (!deliveryId) throw new Error("No se encontró el ID del delivery");

        const response = await bdMercado.get(
          `/pedidos/${pedidoId}/${deliveryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setPedido(response.data.pedido);
        setUserData(response.data.user_data);
        setEstadoPedido(response.data.pedido.estado);
      } catch (err) {
        setError(err.message);
        toast.error(`❌ ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [pedidoId]);

  const cancelarPedido = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("No se encontró el token de usuario");

      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("No se encontró el usuario en localStorage");
      const parsedUser = JSON.parse(storedUser);

      const deliveryId = parsedUser?.related_data?.id;
      if (!deliveryId) throw new Error("No se encontró el ID del delivery");

      await bdMercado.put(
        `/pedidos/cancelar/${pedidoId}`,
        { delivery_id: deliveryId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("✅ Pedido cancelado correctamente");
      navigate("/admin/recoger-pedido");
    } catch (err) {
      setError(err.message);
      toast.error("❌ Hubo un error al cancelar el pedido");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="loadingContainer">
        <FontAwesomeIcon
          icon={faStore}
          spin
          size="3x"
          className="loadingIcon"
        />
        <p>Cargando pedido...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center">Error: {error}</div>;
  }

  return (
    <div className="pedido-ruta-container">
      {/* -- Aviso si no ha sido confirmado aún -- */}
      {estadoPedido !== 4 && (
        <div className="mensaje-instruccion">
          <span role="img" aria-label="ubicacion">📦</span>
          Dirígete al <strong>Mercado Central</strong> para recoger el paquete y confirmar tu pedido.
        </div>
      )}

      <h2 className="pedido-title">Pedido #{pedido.id}</h2>
      <p>
        <span className="label">Dirección de entrega:</span> {pedido.direccion_entrega}
      </p>
      <p>
        <span className="label">Cliente:</span> {userData?.nombre}
      </p>
      {estadoPedido === 4 && (
        <p>
          <span className="label">Celular:</span> {userData?.celular}
        </p>
      )}
      <p>
        <span className="label">Total:</span> S/ {pedido.total}
      </p>

      <h3 className="productos-title">Productos:</h3>
      <ul className="productos-list">
        {pedido.detalles_pedido.map((detalle) => (
          <li key={detalle.id}>
            <strong>{detalle.producto.nombre}</strong> - {detalle.cantidad}{' '}
            {detalle.producto.tipo === "peso" ? "kg" : "uni"}
          </li>
        ))}
      </ul>

      <div className="estado-container">
        {estadoPedido === 4 ? (
          <div
            className="estado-wrapper"
            onClick={() => setMostrarModal(true)}
          >
            <img
              src="https://img.icons8.com/color/64/000000/checked--v1.png"
              alt="Pedido confirmado"
              className="estado-icon"
            />
            <div className="estado-label">Entregar</div>
          </div>
        ) : (
          <div
            className="estado-wrapper cancelar"
            onClick={cancelarPedido}
          >
            <img
              src="https://img.icons8.com/color/64/000000/delete-sign--v1.png"
              alt="Cancelar pedido"
              className="estado-icon"
            />
            <div className="estado-label">Cancelar</div>
          </div>
        )}
      </div>

      {mostrarModal && (
        <ModalEntrega
          onClose={() => setMostrarModal(false)}
          pedidoIdProp={pedido.id}
        />
      )}
    </div>
  );
};

export default PedidoEnRuta;
