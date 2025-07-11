import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getToken } from "../../services/authService";
import "../../../src/styles/css/PedidoEnRuta.css";
import ModalEntrega from "./ModalEntrega"; // ✅ Usamos el nuevo componente

const PedidoEnRuta = () => {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [userData, setUserData] = useState(null); // ➡️ Aquí guardamos los datos de user_data
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

        const userData = JSON.parse(storedUser);
        const deliveryId = userData?.related_data?.id;

        if (!deliveryId) throw new Error("No se encontró el ID del delivery");

        const response = await fetch(`http://127.0.0.1:8000/api/pedidos/${pedidoId}/${deliveryId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Pedido no encontrado o no autorizado");

        const data = await response.json();
        setPedido(data.pedido);        // ✅ Guardar solo pedido
        setUserData(data.user_data);    // ✅ Guardar user_data por separado
        setEstadoPedido(data.pedido.estado);
      } catch (err) {
        setError(err.message);
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

      const userData = JSON.parse(storedUser);
      const deliveryId = userData?.related_data?.id;

      if (!deliveryId) throw new Error("No se encontró el ID del delivery");

      const response = await fetch(`https://mercado-backend/api/pedidos/cancelar/${pedidoId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          delivery_id: deliveryId,
        }),
      });

      if (!response.ok) throw new Error("No se pudo cancelar el pedido");

      navigate("/admin/recoger-pedido");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-gray-500 text-center">Cargando pedido...</div>;
  if (error) return <div className="text-red-600 text-center">Error: {error}</div>;

  return (
    <div className="pedido-container">
      <h2 className="pedido-title">Pedido #{pedido.id}</h2>
      <p>Dirección de entrega: {pedido.direccion_entrega}</p>

      {/* ✅ Mostrar nombre y celular usando userData */}
      <p>Nombre del Cliente: {userData?.nombre}</p>
      <p>Número de Celular: {userData?.celular}</p>

      <p>Total: S/ {pedido.total}</p>

      <h3 className="productos-title">Productos:</h3>
      <ul className="productos-list">
        {pedido.detalles_pedido.map((detalle) => (
          <li key={detalle.id}>
            {detalle.producto.nombre} - {detalle.cantidad} {detalle.producto.tipo === 'peso' ? 'kg' : 'uni'}
          </li>
        ))}
      </ul>

      <div className="estado-container">
        {estadoPedido === 4 ? (
          <div className="estado-wrapper" onClick={() => setMostrarModal(true)}>
            <img
              src="https://img.icons8.com/color/64/000000/checked--v1.png"
              alt="Pedido confirmado"
              className="estado-icon"
            />
            <div className="estado-label">Entregar</div>
          </div>
        ) : (
          <div className="estado-wrapper" onClick={cancelarPedido}>
            <img
              src="https://img.icons8.com/color/64/000000/delete-sign--v1.png"
              alt="Cancelar pedido"
              className="estado-icon"
            />
            <div className="estado-label">Cancelar</div>
          </div>
        )}
      </div>

      {/* Modal externalizado */}
      {mostrarModal && <ModalEntrega onClose={() => setMostrarModal(false)} pedidoIdProp={pedido.id} />}
    </div>
  );
};

export default PedidoEnRuta;
