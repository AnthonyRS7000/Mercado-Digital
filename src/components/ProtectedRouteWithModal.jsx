import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Componente de ruta protegida que muestra un modal de login si el usuario no está autenticado.
 *
 * @param {React.ReactNode} children - Contenido protegido
 * @param {Function} onLoginRequired - Función para abrir el modal
 * @param {React.ReactNode} fallback - Contenido opcional mientras no hay autenticación
 */
const ProtectedRouteWithModal = ({ children, onLoginRequired, fallback = null }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [modalShown, setModalShown] = useState(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isAuthenticated && !modalShown && onLoginRequired) {
      localStorage.setItem('redirectAfterLogin', location.pathname); // 🔐 Guarda la ruta original
      onLoginRequired(); // Abre modal
      setModalShown(true);
    }

    if (isAuthenticated) {
      setModalShown(false); // Reset cuando se loguea
    }
  }, [isAuthenticated, modalShown, onLoginRequired, location]);

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
};

export default ProtectedRouteWithModal;
