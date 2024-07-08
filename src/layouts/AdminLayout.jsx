import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/css/AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <AdminNavbar />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
