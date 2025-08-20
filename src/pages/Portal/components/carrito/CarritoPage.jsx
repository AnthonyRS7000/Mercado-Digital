import React from "react";
import Carrito from "./Carrito";
import styles from "../../css/CarritoPage.module.css";

const CarritoPage = () => {
  return (
    <div className={styles.pageBg}>
      <div className={styles.cartWrapper}>
        {/* Carrito de productos */}
        <div className={styles.productsCol}>
          <Carrito />
        </div>
        {/* El footer/resumen aparece a la derecha solo en desktop (con CSS) */}
        {/* El propio componente Carrito renderiza el ResumenCarrito al fondo en mobile */}
      </div>
    </div>
  );
};

export default CarritoPage;
