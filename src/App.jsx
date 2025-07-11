import { useContext, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom'; 
import { AuthContext } from './context/AuthContext';
import Portal from './pages/Portal/Portal';
import Register from './pages/Register';
import LoginAdmin from './pages/LoginAdmin';
import AdminLayout from './layouts/AdminLayout';
import VenderProducto from './pages/Proveedor/VenderProducto';
import AlistarPedido from './pages/Personal/AlistarPedido';
import RegistrarProveedor from './pages/Proveedor/RegistrarProveedor';
import RegistrarDelivery from './pages/Delivery/RegistrarDelivery';
import RegistrarPersonal from './pages/Personal/RegistrarPersonal';
import ClientLayout from './layouts/ClientLayout';
import CarritoPage from './pages/Portal/components/carrito/CarritoPage';
import Pedido from './pages/Portal/Pedido/Pedido'; 
import PedidoSeguimiento from './pages/Portal/Pedido/PedidoSeguimiento'; 
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRouteWithModal from './components/ProtectedRouteWithModal';
import VerPedidos from './pages/Proveedor/VerPedidos';
import PedidosListosDelivery from './pages/Delivery/PedidosDelivery';
import VerPedidosCliente from './pages/Cliente/VerPedidosCliente';
import PedidosListosApoyo from './pages/Personal/PedidosListosApoyo';
import PedidoEnRuta from './pages/Delivery/PedidoEnRuta';
import ConfirmarPedido from './pages/Personal/ConfirmarPedido';
import LoginModal from './pages/Portal/LoginModal'; 
import ProductoVista from './pages/Portal/components/ProductoVista';


const App = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  
    if (!isAuthenticated) {
      navigate('/'); // no logueado, ir al inicio
    } else {
      const redirectTo = localStorage.getItem('redirectAfterLogin');
      if (redirectTo) {
        navigate(redirectTo); // 🔁 Redirige a donde el usuario intentó ir antes
        localStorage.removeItem('redirectAfterLogin'); // limpia
      }
    }
  };
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginAdmin />} />
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Portal />} />
          <Route path="/producto/:id" element={<ProductoVista />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route 
            path="/seguimiento" 
            element={
              <ProtectedRouteWithModal 
                onLoginRequired={handleOpenLoginModal}
                fallback={<div className="text-center mt-5">
                  <div className="alert alert-info" role="alert">
                    <strong>Para ver tu seguimiento de pedidos, primero debes iniciar sesión</strong>
                  </div>
                </div>}
              >
                <PedidoSeguimiento />
              </ProtectedRouteWithModal>
            } 
          />
          <Route 
            path="/pedido" 
            element={
              <ProtectedRouteWithModal 
                onLoginRequired={handleOpenLoginModal}
                fallback={<div className="text-center mt-5">
                  <div className="alert alert-info" role="alert">
                    <strong>Para realizar un pedido, primero debes iniciar sesión</strong>
                  </div>
                </div>}
              >
                <Pedido />
              </ProtectedRouteWithModal>
            } 
          />
          <Route 
            path="/pedidosclientes" 
            element={
              <ProtectedRouteWithModal 
                onLoginRequired={handleOpenLoginModal}
                fallback={<div className="text-center mt-5">
                  <div className="alert alert-info" role="alert">
                    <strong>Para ver tus pedidos, primero debes iniciar sesión</strong>
                  </div>
                </div>}
              >
                <VerPedidosCliente userId={9} />
              </ProtectedRouteWithModal>
            } 
          />
        </Route>

        {/* Rutas de registro */}
        <Route path="/register/proveedor" element={<Register tipo="proveedor" />} />
        <Route path="/register/delivery" element={<Register tipo="delivery" />} />

        {/* Rutas de administración */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route 
            path="vender-producto" 
            element={
              <ProtectedRoute>
                <VenderProducto />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="ver-pedidos" 
            element={
              <ProtectedRoute>
                <VerPedidos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="alistar-pedido" 
            element={
              <ProtectedRoute>
                <AlistarPedido />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="recoger-pedido" 
            element={
              <ProtectedRoute>
                <PedidosListosDelivery />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="recoger-pedido/:pedidoId" 
            element={
              <ProtectedRoute>
                <PedidoEnRuta />
              </ProtectedRoute>
            }
          />
          <Route 
            path="pedidos-listos" 
            element={
              <ProtectedRoute>
                <PedidosListosApoyo />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="confirmar-pedido" 
            element={
              <ProtectedRoute>
                <ConfirmarPedido />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="registrar-proveedor" 
            element={
              <ProtectedRoute>
                <RegistrarProveedor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="registrar-delivery" 
            element={
              <ProtectedRoute>
                <RegistrarDelivery />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="registrar-personal" 
            element={
              <ProtectedRoute>
                <RegistrarPersonal />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>

      {/* Modal de login que será mostrado cuando se requiera */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={handleCloseLoginModal}
      />
    </>
  );
};

export default App;