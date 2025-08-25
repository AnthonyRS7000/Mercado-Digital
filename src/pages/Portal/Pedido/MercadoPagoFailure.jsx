import { useNavigate } from "react-router-dom";
import styles from "../css/MercadoPagoFailure.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle, faArrowLeft, faRedoAlt } from "@fortawesome/free-solid-svg-icons";

const MercadoPagoFailure = () => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    // 🔁 Simplemente redirige al carrito/pedido para generar nueva preferencia
    navigate("/pedido");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <FontAwesomeIcon icon={faTimesCircle} className={styles.icon} />
        <h2 className={styles.title}>Tu pago fue rechazado</h2>
        <p className={styles.message}>
          Lamentablemente tu pago no se pudo procesar. <br />
          Intenta nuevamente con otro método de pago o vuelve a intentarlo en Mercado Pago.
        </p>

        <div className={styles.actions}>
          <button className={styles.retryButton} onClick={handleRetryPayment}>
            <FontAwesomeIcon icon={faRedoAlt} /> Reintentar pago
          </button>
          <button className={styles.homeButton} onClick={() => navigate("/")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default MercadoPagoFailure;
