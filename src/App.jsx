import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import ProtectedRouteWithModal from './components/ProtectedRouteWithModal';
import VerPedidos from './pages/Proveedor/VerPedidos';
import PedidosListosDelivery from './pages/Delivery/PedidosDelivery';
import VerPedidosCliente from './pages/Cliente/VerPedidosCliente';
import PedidosListosApoyo from './pages/Personal/PedidosListosApoyo';
import PedidoEnRuta from './pages/Delivery/PedidoEnRuta';
import ConfirmarPedido from './pages/Personal/ConfirmarPedido';
import LoginModal from './pages/Portal/LoginModal'; 
import ProductoVista from './pages/Portal/components/ProductoVista';
import RutaAdminPrivada from './pages/RutaAdminPrivada';
import RegisterSolicitud from './pages/RegisterSolicitud';
import SolicitudLayout from './layouts/SolicitudLayout';
import SolicitudesRegistro from './pages/SolicitudesRegistro';
import ProductosProveedor from './pages/Proveedor/ProductosProveedor';
import MercadoPagoSuccess from './pages/Portal/Pedido/MercadoPagoSuccess';

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
          <Route path="/proveedor/:id" element={<ProductosProveedor />} />
          <Route path="/carrito" element={<CarritoPage />} />

          {/* 🚚 Seguimiento de pedidos */}
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

          {/* 🛒 Pedido rápido / programado */}
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

          {/* 📦 Mis pedidos */}
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

          {/* ✅ ÉXITO MERCADO PAGO */}
          <Route 
            path="/mp/success" 
            element={
              <ProtectedRouteWithModal 
                onLoginRequired={handleOpenLoginModal}
                fallback={<div className="text-center mt-5">
                  <div className="alert alert-info" role="alert">
                    <strong>Debes iniciar sesión para confirmar tu pedido</strong>
                  </div>
                </div>}
              >
                {/* aquí MercadoPagoSuccess necesita onConfirm del padre Pedido */}
                <MercadoPagoSuccess />
              </ProtectedRouteWithModal>
            } 
          />
        </Route>

        {/* Rutas de registro */}
        <Route
          path="/register/proveedor"
          element={
            <SolicitudLayout>
              <RegisterSolicitud tipo="proveedor" />
            </SolicitudLayout>
          }
        />

        <Route
          path="/register/delivery"
          element={
            <SolicitudLayout>
              <RegisterSolicitud tipo="delivery" />
            </SolicitudLayout>
          }
        />

        <Route
          path="/register/personal"
          element={
            <SolicitudLayout>
              <RegisterSolicitud tipo="personal_sistema" />
            </SolicitudLayout>
          }
        />

        {/* 🔐 Rutas admin */}
        <Route
          path="/admin/*"
          element={
            <RutaAdminPrivada>
              <AdminLayout />
            </RutaAdminPrivada>
          }
        >
          <Route path="vender-producto" element={<VenderProducto />} />
          <Route path="solicitudes" element={<SolicitudesRegistro />} />
          <Route path="ver-pedidos" element={<VerPedidos />} />
          <Route path="alistar-pedido" element={<AlistarPedido />} />
          <Route path="recoger-pedido" element={<PedidosListosDelivery />} />
          <Route path="recoger-pedido/:pedidoId" element={<PedidoEnRuta />} />
          <Route path="pedidos-listos" element={<PedidosListosApoyo />} />
          <Route path="confirmar-pedido" element={<ConfirmarPedido />} />
          <Route path="registrar-proveedor" element={<RegistrarProveedor />} />
          <Route path="registrar-delivery" element={<RegistrarDelivery />} />
          <Route path="registrar-personal" element={<RegistrarPersonal />} />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />

      {/* Modal de login */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={handleCloseLoginModal}
      />
    </>
  );
};

export default App;
