import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('access_token', userData.token); // Asegúrate de que el token se guarda correctamente
    localStorage.removeItem('carrito_uuid'); // Elimina el uuid del carrito del almacenamiento local

    if (userData.carrito_uuid) {
      localStorage.setItem('carrito_uuid', userData.carrito_uuid); // Guarda el uuid del carrito del usuario autenticado
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('carrito_uuid');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
