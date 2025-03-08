import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Portal from './pages/Portal/Portal';
import Register from './pages/Register';
import LoginAdmin from './pages/LoginAdmin';
import AdminLayout from './layouts/AdminLayout';
import VenderProducto from './pages/Proveedor/VenderProducto';
import AlistarPedido from './pages/Personal/AlistarPedido';
import EntregarPedido from './pages/Delivery/EntregarPedido';
import RegistrarProveedor from './pages/Proveedor/RegistrarProveedor';
import RegistrarDelivery from './pages/Delivery/RegistrarDelivery';
import RegistrarPersonal from './pages/Personal/RegistrarPersonal';
import ClientLayout from './layouts/ClientLayout';
import Carrito from './pages/Portal/components/carrito/Carrito';
import Pedido from './pages/Portal/Pedido/Pedido'; 
import PedidoSeguimiento from './pages/Portal/Pedido/PedidoSeguimiento'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import VerPedidos from './pages/Proveedor/VerPedidos';
import PedidosListos from './pages/Delivery/PedidosPendientes'; // Nueva importación

const App = () => {
  return (  
    <Routes>
      <Route path="/login" element={<LoginAdmin />} />
      <Route path="/" element={<ClientLayout />}>
        <Route index element={<Portal />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route 
          path="/pedido" 
          element={
            <ProtectedRoute>
              <Pedido />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seguimiento" 
          element={
            <ProtectedRoute>
              <PedidoSeguimiento />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/register/proveedor" element={<Register tipo="proveedor" />} />
      <Route path="/register/delivery" element={<Register tipo="delivery" />} />
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
          path="entregar-pedido" 
          element={
            <ProtectedRoute>
              <EntregarPedido />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="pedidos-listos" 
          element={
            <ProtectedRoute>
              <PedidosListos />
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
  );
};

export default App;
