import React, { useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import styles from "../../css/ResumenCarrito.module.css";

const ResumenCarrito = ({ cart, onPlaceOrder }) => {
  const context = useContext(AuthContext);
  const realCart = cart || context.cart;

  if (!realCart || !realCart.productos || realCart.productos.length === 0) return null;

  // Se usa el callback recibido o solo log si no hay (para test)
  const handlePlaceOrder = onPlaceOrder || (() => {});

  return (
    <div className={styles.resumenBox}>
      <div className={styles.deliveryBox}>
        <span>Delivery</span>
        <span>Envío gratis por compras mayores a S/ 100</span>
      </div>
      <div className={styles.totalRow}>
        <span>Total</span>
        <span className={styles.cartTotal}>
          S/. {realCart.total_precio ? realCart.total_precio.toFixed(2) : "0.00"}
        </span>
      </div>
      <button className={styles.nextBtn} onClick={handlePlaceOrder}>Siguiente</button>
    </div>
  );
};

export default ResumenCarrito;
