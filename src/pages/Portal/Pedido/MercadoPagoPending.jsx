import { useNavigate } from "react-router-dom";
import styles from "./css/MercadoPagoPending.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHourglassHalf, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const MercadoPagoPending = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <FontAwesomeIcon icon={faHourglassHalf} className={styles.icon} />
        <h2 className={styles.title}>Tu pago está pendiente</h2>
        <p className={styles.message}>
          Estamos esperando la confirmación de tu pago. <br />
          Te notificaremos cuando el proceso finalice.
        </p>

        <div className={styles.actions}>
          <button className={styles.homeButton} onClick={() => navigate("/")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default MercadoPagoPending;
