import "../../../src/styles/css/PedidosListosApoyo.css";
import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const PedidosListosApoyo = () => {
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

        const response = await fetch("https://mercado-backend/api/pedidos/pendientes", {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
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

  const handleAceptarPedido = async (id, detallesPedido) => {
    try {
      const todosListos = detallesPedido.every((detalle) => detalle.cantidad > 0);
  
      if (!todosListos) {
        alert("No todos los productos están listos para ser enviados.");
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
      if (!userData || !userData.related_data) {
        throw new Error("Usuario no encontrado o no tiene datos relacionados");
      }
  
      const recolectorId = userData.related_data.id;
  
      const url = `http://127.0.0.1:8000/api/pedidos/llamardelivery/${id}`;
      const payload = {
        personal_sistema_id: recolectorId,
      };
  
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Respuesta del servidor:", errorText);
        throw new Error("Error al llamar al delivery");
      }
  
      const data = await response.json();
      console.log("Pedido enviado a delivery:", data);
  
      // ✅ Remover el pedido del estado
      setPedidos((prevPedidos) => prevPedidos.filter((pedido) => pedido.id !== id));
  
      alert("El pedido ha sido marcado para delivery");
    } catch (error) {
      console.error("Error al actualizar el pedido:", error);
      alert("Hubo un error al enviar el pedido a delivery");
    }
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
              <p>Total: <span>{pedido.total}</span></p>
              
              <div className="productos-list">
                <h4>Productos:</h4>
                {pedido.detalles_pedido && pedido.detalles_pedido.length > 0 ? (
                  pedido.detalles_pedido.map((detalle) => (
                    <div key={detalle.id} className="producto-item">
                      <p><strong>Producto:</strong> {detalle.producto.nombre}</p>
                      <p><strong>Cantidad:</strong> {detalle.cantidad}{detalle.producto.tipo === 'peso' ? 'kg' : 'uni'}</p>
                    </div>
                  ))
                ) : (
                  <p>No hay productos para este pedido</p>
                )}
              </div>

              <button
                onClick={() => handleAceptarPedido(pedido.id, pedido.detalles_pedido)}
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
