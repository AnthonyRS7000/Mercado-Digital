import React, { createContext, useState, useEffect } from 'react';
import bdMercado from '../services/bdMercado';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        if (user) {
          const response = await bdMercado.get(`/carrito/user/${user.related_data.user_id}`);
          setCartCount(response.data.productos.length);
        } else {
          const uuid = localStorage.getItem('carrito_uuid');
          if (uuid) {
            const response = await bdMercado.get(`/carrito/uuid/${uuid}`);
            setCartCount(response.data.productos.length);
          }
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartCount(0);
      }
    };

    fetchCartCount();
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Fetch cart count after login
    const fetchCartCount = async () => {
      try {
        const response = await bdMercado.get(`/carrito/user/${userData.related_data.user_id}`);
        setCartCount(response.data.productos.length);
      } catch (error) {
        console.error('Error fetching cart count after login:', error);
      }
    };
    fetchCartCount();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('data');
    localStorage.removeItem('token');
    localStorage.removeItem('carrito_uuid');
    // Reset cart count on logout
    setCartCount(0);
    // Eliminar cualquier otro dato relacionado con el usuario si es necesario
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, cartCount, setCartCount }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
