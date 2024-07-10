// src/App.jsx
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
import Carrito from './pages/Portal/components/Carrito';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginAdmin />} />
      <Route path="/" element={<ClientLayout />}>
        <Route index element={<Portal />} />
        <Route path="/carrito" element={<Carrito />} />
      </Route>
      <Route path="/register/proveedor" element={<Register tipo="proveedor" />} />
      <Route path="/register/delivery" element={<Register tipo="delivery" />} />
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route path="vender-producto" element={<VenderProducto />} />
        <Route path="alistar-pedido" element={<AlistarPedido />} />
        <Route path="entregar-pedido" element={<EntregarPedido />} />
        <Route path="registrar-proveedor" element={<RegistrarProveedor />} />
        <Route path="registrar-delivery" element={<RegistrarDelivery />} />
        <Route path="registrar-personal" element={<RegistrarPersonal />} />
      </Route>
    </Routes>
  );
};

export default App;
