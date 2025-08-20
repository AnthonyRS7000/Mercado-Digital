import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const MercadoPagoSuccess = ({ onConfirm }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const address = searchParams.get('address');

    if (onConfirm && address) {
      onConfirm(2, address).then(() => {
        navigate('/seguimiento');
      });
    }
  }, [searchParams, onConfirm, navigate]);

  return (
    <div className="text-center mt-5">
      <h2>Procesando pago...</h2>
      <p>Estamos confirmando tu pedido.</p>
    </div>
  );
};

export default MercadoPagoSuccess;
