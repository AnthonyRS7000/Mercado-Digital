import React, { useContext } from 'react';
import { GoogleLogin as GoogleLoginButton } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import bdMercado from '../../services/bdMercado';
import styles from './css/LoginCliente.module.css';

const GoogleLogin = ({ onClose, setLoading }) => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { saveData } = useContext(DataContext);

  const handleLoginSuccess = async (response) => {
    const { credential } = response;
    setLoading(true);
    try {
      const res = await bdMercado.post('/auth/google-login', {
        token: credential,
      });

      const userData = res.data;
      const token = userData.access_token;
      const userId = userData.user.related_data?.user_id;

      localStorage.setItem('data', JSON.stringify(userData));
      localStorage.setItem('token', token);

      saveData(userData);
      login(userData.user);

      if (userId) {
        const uuid = localStorage.getItem('carrito_uuid');
        if (uuid) {
          try {
            await bdMercado.post('/carrito/merge', { uuid, user_id: userId });
            localStorage.removeItem('carrito_uuid');
          } catch (err) {
            console.error('Error merging cart:', err);
          }
        }
      }

      if (onClose) onClose();

      const redirectTo = localStorage.getItem('redirectAfterLogin');
      if (redirectTo) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectTo);
      }
    } catch (error) {
      console.error('Error durante la autenticación de Google:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (error) => {
    console.error('Error en Google login', error);
  };

  return (
    <div className={styles.googleLoginContainer}>
      <div className={styles.googleButtonWrapper}>
        <GoogleLoginButton
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
          useOneTap
          theme="filled_blue"
          shape="rectangular"
          text="signin_with"
          locale="es"
          width="100%"
        />
      </div>
    </div>
  );
};

export default GoogleLogin;
