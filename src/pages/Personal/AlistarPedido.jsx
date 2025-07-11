import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { AiOutlineCheckCircle } from "react-icons/ai";
import '../../styles/css/AlistarPedido.css';

const AlistarPedido = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPedido, setExpandedPedido] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const userToken = getToken();
        if (!userToken) {
          throw new Error("No se encontró el token de usuario");
        }

        const response = await fetch("http://127.0.0.1:8000/api/pedidos/notificados", {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        const pedidosAgrupados = Object.keys(data).map((pedido_id) => {
          const productosVisibles = data[pedido_id].filter(
            (producto) => producto.notificado_proveedor !== 2
          );

          return {
            pedido_id,
            productos: productosVisibles,
          };
        });

        setPedidos(pedidosAgrupados);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  const handleNotificarProveedor = async (pedidoId, productoId) => {
    try {
      const userToken = getToken();
      const storedData = localStorage.getItem("user");
      if (!storedData) {
        throw new Error("No se encontró el objeto 'user' en el almacenamiento local.");
      }
      const userData = JSON.parse(storedData);

      if (!userData || !userData.related_data) {
        throw new Error("Usuario no encontrado o no tiene datos relacionados");
      }

      const recolectorId = userData.related_data.id;

      const response = await fetch(`http://127.0.0.1:8000/api/pedidos/marcar-listo/${pedidoId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          producto_id: productoId,
          recolector_id: recolectorId,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al marcar el producto como listo");
      }

      window.location.reload();
    } catch (error) {
      alert("Hubo un error al marcar como listo");
    }
  };

  const togglePedidoExpand = (pedidoId) => {
    setExpandedPedido(expandedPedido === pedidoId ? null : pedidoId);
  };

  return (
    <div className="alistar-pedido-container">
      <h2 className="alistar-pedido-title">Pedidos Notificados</h2>
      {loading ? (
        <div className="spinner-container">
          <AiOutlineLoading3Quarters className="loading-icon" />
        </div>
      ) : error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : pedidos.length === 0 ? (
        <p className="text-gray-700 text-center">No hay pedidos notificados</p>
      ) : (
        <div className="pedidos-list">
          {pedidos.map((pedido) => (
            <div key={pedido.pedido_id} className="pedido-container">
              <div className="pedido-header">
                <h3>Pedido ID: {pedido.pedido_id}</h3>
                <button
                  className="expand-btn"
                  onClick={() => togglePedidoExpand(pedido.pedido_id)}
                >
                  {expandedPedido === pedido.pedido_id ? "Ocultar productos" : "Ver productos"}
                </button>
              </div>
              {expandedPedido === pedido.pedido_id && (
                <div className="productos-list">
                  <h4>Productos:</h4>
                  {pedido.productos.length > 0 ? (
                    pedido.productos.map((producto) => (
                      <div key={producto.id} className="producto-item">
                        <p><strong>Producto:</strong> {producto.producto.nombre}</p>
                        <p><strong>Proveedor:</strong> {producto.producto.proveedor.nombre}</p>
                        <p><strong>Bodega:</strong> {producto.producto.proveedor.nombre_empresa}</p>
                        <p><strong>Cantidad:</strong> {producto.cantidad} {producto.producto.tipo === 'peso' ? 'kg' : 'uni'}</p>
                        <p><strong>Total:</strong> S/ {parseFloat(producto.subtotal).toFixed(2)}</p>

                        {producto.notificado_proveedor === 0 ? (
                          <button className="notificar-btn" disabled>
                            Falta alistar
                          </button>
                        ) : producto.notificado_proveedor === 1 ? (
                          <button 
                            onClick={() => handleNotificarProveedor(pedido.pedido_id, producto.producto.id)} 
                            className="notificar-btn green"
                          >
                            Recoger
                          </button>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p>No hay productos para este pedido</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlistarPedido;
