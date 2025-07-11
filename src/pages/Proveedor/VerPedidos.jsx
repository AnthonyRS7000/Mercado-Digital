import React, { useEffect, useState, useContext } from "react";
import bdMercado from "../../services/bdMercado";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/css/VerPedidos.css";

const VerPedidos = () => {
  const { user } = useContext(AuthContext);
  const [pedidos, setPedidos] = useState([]);

  // Función para obtener los pedidos
  const fetchPedidos = async () => {
    try {
      const response = await bdMercado.get(`/proveedor/pedidos/${user.related_data.id}`);
      const pedidosOrdenados = response.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setPedidos(pedidosOrdenados);
    } catch (error) {
      console.error("Error obteniendo pedidos:", error);
    }
  };

  useEffect(() => {
    if (user && user.related_data) {
      fetchPedidos();
    }
  }, [user]);

  // Función para notificar al recolector
  const notificarRecolector = async (pedidoId, detalleId, productoId) => {
    try {
      // Enviar la solicitud PUT con el pedido_id en la URL, y proveedor_id y producto_id en el cuerpo
      const response = await bdMercado.put(`/pedidos/notificar-recolector/${pedidoId}`, {
        proveedor_id: user.related_data.id,  // Proveedor que está notificando
        producto_id: productoId,             // Producto que se está notificando
      });
  
      // Filtra los detalles del pedido, y actualiza solo el producto que se notificó
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) =>
          pedido.id === pedidoId
            ? {
                ...pedido,
                detalles_pedido: pedido.detalles_pedido.map((detalle) =>
                  detalle.id === detalleId
                    ? { ...detalle, notificado_proveedor: 2 } // Actualiza solo el detalle notificado
                    : detalle
                ),
              }
            : pedido
        )
      );
  
      // Si el estado del pedido cambia a 2, también actualizarlo en el frontend
      const todosListos = response.data.todos_listos;  // Verifica si todos los productos están listos (usado en el backend)
      if (todosListos) {
        setPedidos((prevPedidos) =>
          prevPedidos.map((pedido) =>
            pedido.id === pedidoId
              ? { ...pedido, estado: 2 }  // Cambiar el estado del pedido a 2
              : pedido
          )
        );
      }
  
      // Abrir WhatsApp con el mensaje
      window.open(response.data.link_whatsapp, "_blank");

      // Llamar a fetchPedidos para actualizar los pedidos después de la notificación
      fetchPedidos();
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
              <th> ID </th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
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
                    <td>{new Date(pedido.created_at).toLocaleString()}</td>
                    <td><strong>S/ {parseFloat(detalle.subtotal).toFixed(2)}</strong></td>
                    <td>
                      <button 
                        className="btn-entregar" 
                        onClick={() => notificarRecolector(pedido.id, detalle.id, detalle.producto.id)}>
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
