import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import Topbar from '../components/Topbar';
import '../styles/css/AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminNavbar isOpen={isSidebarOpen} onLinkClick={closeSidebar} />

      {/* Overlay solo si el navbar está abierto */}
      {isSidebarOpen && <div className="navbar-overlay" onClick={closeSidebar}></div>}

      <div className="admin-content">
        <Topbar toggleSidebar={toggleSidebar} />
        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
