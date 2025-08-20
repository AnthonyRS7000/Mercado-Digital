import React, { createContext, useState, useEffect } from 'react';
import bdMercado from '../services/bdMercado';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // Estado del usuario logueado
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cartCount, setCartCount] = useState(0);
  const [cartRefreshTrigger, setCartRefreshTrigger] = useState(0);

  // Estado controlado y persistente para el UUID del carrito invitado
  const [guestUuid, setGuestUuid] = useState(() => {
    let uuid = localStorage.getItem('carrito_uuid');
    if (!uuid) {
      uuid = generateUUID();
      localStorage.setItem('carrito_uuid', uuid);
    }
    return uuid;
  });

  function generateUUID() {
    if (window.crypto?.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Refresca el contador y trigger si se requiere
  const refreshCartCount = async (forceRefresh = false) => {
    try {
      if (user && user.related_data) {
        // Usuario autenticado
        const response = await bdMercado.get(`/carrito/user/${user.related_data.user_id}`);
        if (response.data && response.data.productos) {
          setCartCount(response.data.productos.length);
        } else {
          setCartCount(0);
        }
      } else {
        // Usuario invitado
        let uuid = guestUuid; // SIEMPRE usa guestUuid del estado
        if (!uuid) {
          uuid = generateUUID();
          localStorage.setItem('carrito_uuid', uuid);
          setGuestUuid(uuid); // Esto solo debería ocurrir si guestUuid se perdió por alguna razón rara
        }
        try {
          const response = await bdMercado.get(`/carrito/uuid/${uuid}`);
          if (response.data && response.data.productos) {
            const newCount = response.data.productos.length;
            setCartCount(newCount);
            if (forceRefresh || newCount !== cartCount) {
              setCartRefreshTrigger(prev => prev + 1);
            }
          } else {
            setCartCount(0);
          }
        } catch (error) {
          setCartCount(0);
        }
      }
    } catch (error) {
      setCartCount(0);
    }
  };

  // Efecto: solo refresca carrito cuando cambia usuario (login/logout)
  useEffect(() => {
    // Si guestUuid está null, recupera o genera y sincroniza.
    if (!user && !guestUuid) {
      let uuid = localStorage.getItem('carrito_uuid');
      if (!uuid) {
        uuid = generateUUID();
        localStorage.setItem('carrito_uuid', uuid);
      }
      setGuestUuid(uuid);
    }
    refreshCartCount(true);
  }, [user, guestUuid]);

  const login = async (userData) => {
    const guestUuidLocal = localStorage.getItem('carrito_uuid');
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (guestUuidLocal && userData.related_data?.user_id) {
      try {
        await bdMercado.post('/carrito/merge', {
          uuid: guestUuidLocal,
          user_id: userData.related_data.user_id
        });
      } catch (error) {
        // Silenciado, fallo al fusionar carrito
      }
    }
    // Aquí SÍ se elimina el uuid de invitado porque ahora el usuario tiene su propio carrito
    localStorage.removeItem('carrito_uuid');
    setGuestUuid(null);
    await refreshCartCount(true);
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('data');
    localStorage.removeItem('token');
    setCartCount(0);
    setCartRefreshTrigger(prev => prev + 1);

    // NO GENERES un nuevo uuid aquí: simplemente asegúrate de que guestUuid sigue existiendo en localStorage/estado
    let uuid = localStorage.getItem('carrito_uuid');
    if (!uuid) {
      uuid = generateUUID();
      localStorage.setItem('carrito_uuid', uuid);
      setGuestUuid(uuid);
    } else {
      setGuestUuid(uuid); // Fuerza sincronización si era null
    }
    await refreshCartCount(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        cartCount,
        setCartCount,
        refreshCartCount,
        cartRefreshTrigger,
        setCartRefreshTrigger,   // expón esto para que los modales puedan disparar refrescos
        guestUuid,
        setGuestUuid,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;