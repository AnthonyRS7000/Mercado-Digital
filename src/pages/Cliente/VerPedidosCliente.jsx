import React, { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { getToken } from "../../services/authService";  // Asegúrate de tener esta función de obtener el token
import './VerPedidosCliente.css';

const VerPedidos = ({ userId }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener los pedidos de la API
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const userToken = getToken();  // Obtener el token de usuario
        if (!userToken) {
          throw new Error("No se encontró el token de usuario");
        }

        const response = await fetch(`http://127.0.0.1:8000/api/pedidos/cliente/${userId}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Pedidos obtenidos:", data);

        setPedidos(data);
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [userId]);

  // Si la respuesta está cargando o hubo un error
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
