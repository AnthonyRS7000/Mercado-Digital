import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import Topbar from '../components/Topbar'; // 👈 importa el Topbar
import '../styles/css/AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para controlar la barra lateral
  const sidebarRef = useRef(null); // Referencia para el navbar
  const layoutRef = useRef(null); // Referencia para toda la estructura del layout (para detectar clics fuera)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Cambia el estado de la visibilidad de la barra lateral
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false); // Función para cerrar la barra lateral
  };

  // Cerrar la barra lateral si el clic se hace fuera del navbar
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Si el clic fue fuera del navbar y fuera de la estructura del layout
      if (layoutRef.current && !layoutRef.current.contains(e.target)) {
        closeSidebar(); // Cierra el navbar si se hace clic fuera de él
      }
    };

    document.addEventListener('click', handleClickOutside);

    // Cleanup: eliminar el event listener cuando el componente se desmonte
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="admin-layout" ref={layoutRef}>
      <div ref={sidebarRef}>
        <AdminNavbar isOpen={isSidebarOpen} onLinkClick={closeSidebar} /> {/* Pasa isOpen y closeSidebar a AdminNavbar */}
      </div>
      <div className="admin-content">
        <Topbar toggleSidebar={toggleSidebar} /> {/* Pasa toggleSidebar a Topbar */}
        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
