import "../../../src/styles/css/PedidosPendientes.css";
import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const PedidosPendientes = () => {
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

        const response = await fetch("http://127.0.0.1:8000/api/pedidos/pendientes", {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Respuesta de la API:", data);
        setPedidos(data);
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  const handleAceptarPedido = (id) => {
    console.log(`Pedido ${id} aceptado`);
  };

  return (
    <div className="pedidos-container">
      <h2 className="pedidos-title">Pedidos Pendientes</h2>
      {loading ? (
        <div className="spinner-container">
          <AiOutlineLoading3Quarters className="loading-icon" />
        </div>
      ) : error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : pedidos.length === 0 ? (
        <p className="text-gray-700 text-center">No hay pedidos pendientes</p>
      ) : (
        <div className="pedido-grid">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="pedido-card">
              <h3>Pedido #{pedido.id}</h3>
              <p>Dirección: <span>{pedido.direccion_entrega}</span></p>
              <p>Producto: <span>{pedido.detalles_pedido?.[0]?.producto?.nombre ?? "Sin nombre"}</span></p>
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

export default PedidosPendientes;
v