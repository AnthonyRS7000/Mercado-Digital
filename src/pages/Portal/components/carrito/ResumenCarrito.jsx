import React, { useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import styles from "../../css/ResumenCarrito.module.css";

const ResumenCarrito = () => {
  const { cart } = useContext(AuthContext);

  if (!cart || !cart.productos || cart.productos.length === 0) return null;

  return (
    <div className={styles.resumenBox}>
      <div className={styles.deliveryBox}>
        <span>Delivery</span>
        <span>Envío gratis por compras mayores a S/ 100</span>
      </div>
      <div className={styles.totalRow}>
        <span>Total</span>
        <span className={styles.cartTotal}>
          S/. {cart.total_precio ? cart.total_precio.toFixed(2) : "0.00"}
        </span>
      </div>
      <button className={styles.nextBtn}>Siguiente</button>
    </div>
  );
};

export default ResumenCarrito;
