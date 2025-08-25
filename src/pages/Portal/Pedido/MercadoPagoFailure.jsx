import { useNavigate } from "react-router-dom";

const MercadoPagoFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center mt-5">
      <h2 className="text-danger">❌ Tu pago fue rechazado</h2>
      <p>Intenta nuevamente con otro método de pago.</p>
      <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
        Volver al inicio
      </button>
    </div>
  );
};

export default MercadoPagoFailure;
