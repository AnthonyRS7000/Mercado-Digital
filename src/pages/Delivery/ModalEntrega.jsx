import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../services/authService";
import "../../styles/css/ModalEntrega.css";

const ModalEntrega = ({ onClose, pedidoIdProp }) => {
  const navigate = useNavigate();
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [comentario, setComentario] = useState("");
  const [precio, setPrecio] = useState("");
  const [estado, setEstado] = useState(2);
  const [pedidoId, setPedidoId] = useState("");
  const [deliveryId, setDeliveryId] = useState("");
  const [imagenEntrega, setImagenEntrega] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fechaHoy = new Date().toISOString().split('T')[0];
    setFechaEntrega(fechaHoy);
    setPedidoId(pedidoIdProp);

    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData?.related_data?.id) {
      setDeliveryId(userData.related_data.id);
    } else {
      console.error("No se encontró el ID del delivery en localStorage.");
    }
  }, [pedidoIdProp]);

  const entregarPedido = async () => {
    if (!pedidoId || !deliveryId) {
      alert("Error: Falta el ID del pedido o del delivery.");
      return;
    }

    const formData = new FormData();
    formData.append("fecha_entrega", fechaEntrega);
    formData.append("comentario", comentario);
    formData.append("precio", precio);
    formData.append("estado", estado);
    formData.append("pedido_id", pedidoId);
    formData.append("delivery_id", deliveryId);
    if (imagenEntrega) formData.append("imagen_entregas", imagenEntrega);

    try {
      const token = getToken();
      const response = await fetch("https://mercado-backend/api/entregas", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json();
        console.error("Error en la respuesta:", errorData);
        alert("Hubo un problema al entregar el pedido.");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/admin/recoger-pedido");
  };

  const closeModal = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="entrega-modal-wrapper">
      <div className="entrega-modal-overlay" onClick={handleOverlayClick}>
        <div className="entrega-modal-container">
          <button className="entrega-modal-close" onClick={closeModal}>&times;</button>
          <h2>Entregar Pedido</h2>

          <div>
            <label>Fecha de Entrega</label>
            <input type="date" value={fechaEntrega} disabled />
          </div>

          <div>
            <label>Comentario</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>

          <div>
            <label>Precio</label>
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>

          <div>
            <label>Imagen de Entrega</label>
            <input
              type="file"
              onChange={(e) => setImagenEntrega(e.target.files[0])}
            />
          </div>

          <button className="entrega-modal-button" onClick={entregarPedido}>Entregar</button>

          {showSuccessModal && (
            <div className="entrega-success-overlay">
              <div className="entrega-success-content">
                <h2>¡Éxito!</h2>
                <p>El pedido ha sido entregado correctamente.</p>
                <button onClick={closeSuccessModal}>Ok</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEntrega;
