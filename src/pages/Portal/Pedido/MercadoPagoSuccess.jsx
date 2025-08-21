import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bdMercado from '../../../services/bdMercado';

const MercadoPagoSuccess = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
          navigate('/login');
          return;
        }

        const res = await bdMercado.get(`/pedido/last/${user.id}`);
        if (res.data) {
          navigate('/seguimiento', { state: { pedido: res.data } });
        } else {
          navigate('/seguimiento');
        }
      } catch (error) {
        console.error('Error al obtener el último pedido:', error);
        navigate('/seguimiento');
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [navigate]);

  return (
    <div className="text-center mt-5">
      {loading ? (
        <>
          <h2>Procesando pago...</h2>
          <p>Estamos confirmando tu pedido.</p>
        </>
      ) : (
        <h2>Redirigiendo a seguimiento...</h2>
      )}
    </div>
  );
};

export default MercadoPagoSuccess;
