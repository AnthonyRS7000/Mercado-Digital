import { useNavigate } from "react-router-dom";

const MercadoPagoPending = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center mt-5">
      <h2 className="text-warning">⏳ Tu pago está pendiente</h2>
      <p>Estamos esperando la confirmación de tu pago.</p>
      <button className="btn btn-secondary mt-3" onClick={() => navigate("/")}>
        Volver al inicio
      </button>
    </div>
  );
};

export default MercadoPagoPending;
