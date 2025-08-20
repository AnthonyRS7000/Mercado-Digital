import React, { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { getToken } from "../../services/authService";
import bdMercado from "../../services/bdMercado"; // ← Importa la instancia
import './VerPedidosCliente.css';

const VerPedidos = ({ userId }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const userToken = getToken();
        if (!userToken) {
          throw new Error("No se encontró el token de usuario");
        }

        // Usa bdMercado con el endpoint (solo el path)
        const response = await bdMercado.get(`/pedidos/cliente/${userId}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        });

        setPedidos(response.data);
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [userId]);

  if (loading) {
    return (
      <div className="spinner-container">
        <AiOutlineLoading3Quarters className="loading-icon" />
      </div>
    );
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="pedidos-container">
      <h2>Mis Pedidos</h2>
      {pedidos.length === 0 ? (
        <p>No tienes pedidos.</p>
      ) : (
        <div className="pedidos-list">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="pedido-card">
              <div className="pedido-header">
                <h3>Pedido ID: {pedido.id}</h3>
                <span>{pedido.estado === 1 ? "Pendiente" : "Completado"}</span>
              </div>
              <p><strong>Fecha:</strong> {pedido.fecha}</p>
              <p><strong>Total:</strong> S/ {pedido.total}</p>
              <p><strong>Dirección de entrega:</strong> {pedido.direccion_entrega}</p>
              <div className="pedido-footer">
                <p><strong>Método de pago:</strong> {pedido.metodo_pago_id === 1 ? "Efectivo" : "Tarjeta"}</p>
                <p><strong>Estado:</strong> {pedido.estado === 1 ? "Pendiente" : "Completado"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerPedidos;
