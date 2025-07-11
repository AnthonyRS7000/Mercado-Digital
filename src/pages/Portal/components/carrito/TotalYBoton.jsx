import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/TotalYBoton.module.css";

const TotalYBoton = ({ total, disabled, onPlaceOrder }) => {
  const navigate = useNavigate();
  return (
    <div className={styles.totalBox}>
      <div className={styles.totalLabelRow}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>S/. {Number(total).toFixed(2)}</span>
      </div>
      <button
        className={styles.nextBtn}
        onClick={() => onPlaceOrder(navigate)}
        disabled={disabled}
      >
        Siguiente
      </button>
    </div>
  );
};

export default TotalYBoton;
