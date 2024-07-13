import React, { useEffect, useState, useContext } from 'react';
import bdMercado from '../../../services/bdMercado';
import { AuthContext } from '../../../context/AuthContext';

const Carrito = () => {
  const [cart, setCart] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          const response = await bdMercado.get(`/carrito/${user.related_data.id}`);
          setCart(response.data);
        } catch (error) {
          console.error('Error fetching cart:', error);
        }
      }
    };

    fetchCart();
  }, [user]);

  if (!cart) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Renderiza el contenido del carrito aquí */}
    </div>
  );
};

export default Carrito;
