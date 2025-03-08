import React, { useEffect, useState, useContext } from "react";
import bdMercado from "../../services/bdMercado";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/css/VerPedidos.css";

const VerPedidos = () => {
  const { user } = useContext(AuthContext);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await bdMercado.get(`/pedidos/proveedor/${user.related_data.id}`);
        const pedidosOrdenados = response.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setPedidos(pedidosOrdenados);
      } catch (error) {
        console.error("Error obteniendo pedidos:", error);
      }
    };

    if (user && user.related_data) {
      fetchPedidos();
    }
  }, [user]);

  const notificarRecolector = async (pedidoId, detalleId) => {
    try {
      const response = await bdMercado.put(`/pedidos/notificar-recolector/${detalleId}`, {
        proveedor_id: user.related_data.id,
      });
      window.open(response.data.link_whatsapp, "_blank");

      // Filtra el producto notificado sin eliminar todo el pedido
      setPedidos((prevPedidos) =>
        prevPedidos
          .map((pedido) =>
            pedido.id === pedidoId
              ? {
                  ...pedido,
                  detalles_pedido: pedido.detalles_pedido.filter((detalle) => detalle.id !== detalleId),
                }
              : pedido
          )
          .filter((pedido) => pedido.detalles_pedido.length > 0) // Elimina pedidos vacíos
      );
    } catch (error) {
      console.error("Hubo un error al notificar al recolector:", error);
    }
  };

  return (
    <div className="ver-pedidos-container">
      <h1>Mis Pedidos Vendidos</h1>
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Fecha y Hora</th>
              <th>Total</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length > 0 ? (
              pedidos.map((pedido) =>
                pedido.detalles_pedido.map((detalle) => (
                  <tr key={detalle.id}>
                    <td>{pedido.id}</td>
                    <td>{pedido.user?.name || "Cliente Desconocido"}</td>
                    <td>{detalle.producto.nombre}</td>
                    <td>{parseFloat(detalle.cantidad)} {detalle.producto.tipo === "peso" ? "kg" : "unid"}</td>
                    <td>S/ {detalle.producto.precio}</td>
                    <td className="stock-container"><i className="fas fa-box"></i> {detalle.producto.stock}</td>
                    <td>{new Date(pedido.created_at).toLocaleString()}</td>
                    <td><strong>S/ {parseFloat(detalle.subtotal).toFixed(2)}</strong></td>
                    <td>
                      <button className="btn-entregar" onClick={() => notificarRecolector(pedido.id, detalle.id)}>
                        Notificar Recolector
                      </button>
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan="9" className="no-pedidos">No tienes pedidos pendientes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerPedidos;
