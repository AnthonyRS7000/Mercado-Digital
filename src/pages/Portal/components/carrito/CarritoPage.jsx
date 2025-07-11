import React from "react";
import Carrito from "./Carrito";
import ResumenCarrito from "./ResumenCarrito";
import styles from "../../css/CarritoPage.module.css";

const CarritoPage = () => {
  return (
    <div className={styles.pageBg}>
      <div className={styles.cartWrapper}>
        {/* Columna izquierda: Carrito */}
        <div className={styles.productsCol}>
          <Carrito hideFooterOnDesktop={true} />
        </div>
        {/* Columna derecha: ResumenCarrito SOLO en desktop */}
        <div className={styles.summaryCol}>
          <ResumenCarrito />
        </div>
      </div>
    </div>
  );
};

export default CarritoPage;
