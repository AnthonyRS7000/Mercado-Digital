import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MercadoPagoSuccess = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/seguimiento');
      setLoading(false);
    }, 1500); // espera corta para mostrar mensaje

    return () => clearTimeout(timer);
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
