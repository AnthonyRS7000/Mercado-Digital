import React from "react";
import styles from "../styles/css/RegisterSolicitudLayout.module.css";

function SolicitudLayout({ children }) {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftImage}>
        <img src="/Antiguo_Mercado_Huanuco.png" alt="Imagen institucional" />
      </div>
      <div className={styles.rightContent}>
        {children}
      </div>
    </div>
  );
}

export default SolicitudLayout;
