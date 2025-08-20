// src/routes/RutaAdminPrivada.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const adminRoles = [2, 3, 4, 20]; // Ajusta según tus roles de admin

const RutaAdminPrivada = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // No logueado
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <h1>No autorizado</h1>
      </div>
    );
  }

  if (!adminRoles.includes(user.num_rol)) {
    // Logueado pero no es admin
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <h1>No autorizado</h1>
      </div>
    );
  }

  // Es admin
  return children;
};

export default RutaAdminPrivada;
