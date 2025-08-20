// components/ModalConfirmacion.jsx
import React from "react";
import "../../styles/css/ModalConfirmacion.css";

const ModalConfirmacion = ({
  open,
  titulo = "Confirmar acción",
  mensaje,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  children,
}) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box" role="dialog" aria-modal="true">
        <h2>{titulo}</h2>
        <p>{mensaje}</p>
        {children}
        <div className="modal-actions">
          <button className="btn-modal-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
          <button className="btn-modal-cancel" onClick={onCancel}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;
