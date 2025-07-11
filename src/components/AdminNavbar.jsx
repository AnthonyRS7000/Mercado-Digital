import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart, faBox, faShippingFast, faUserPlus, faMotorcycle,
  faUserFriends, faClipboardList, faCheckCircle, faHandsHelping, faThumbsUp
} from '@fortawesome/free-solid-svg-icons';
import '../styles/css/AdminNavbar.css';

const AdminNavbar = ({ isOpen, onLinkClick }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`admin-navbar ${isOpen ? 'open' : ''}`}>
      <div className="admin-navbar-logo">
        <img src="/Logo.svg" alt="Logo" />
        <h2>MercadoDigital<br />Huanuco</h2>
      </div>
      <ul className="admin-navbar-menu">
        {/* ADMIN - Puede ver TODO */}
        {user?.num_rol === 20 && (
          <>
            <li>
              <Link to="/admin/vender-producto" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faShoppingCart} className="fa-icon" /> <span>Vender Producto</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/registrar-proveedor" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faUserPlus} className="fa-icon" /> <span>Registrar Proveedor</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/registrar-delivery" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faMotorcycle} className="fa-icon" /> <span>Registrar Delivery</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/registrar-personal" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faUserFriends} className="fa-icon" /> <span>Registrar Personal</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/ver-pedidos" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faClipboardList} className="fa-icon" /> <span>Mis Pedidos</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/alistar-pedido" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faBox} className="fa-icon" /> <span>Alistar Pedido</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/confirmar-pedido" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faThumbsUp} className="fa-icon" /> <span>Confirmar Pedido</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/recoger-pedido" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faHandsHelping} className="fa-icon" /> <span>Recoger Pedido</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/entregar-pedido" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faShippingFast} className="fa-icon" /> <span>Entregar Pedido</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/pedidos-listos" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faCheckCircle} className="fa-icon" /> <span>Pedidos Listos</span>
              </Link>
            </li>
          </>
        )}

        {/* PROVEEDOR */}
        {user?.num_rol === 2 && (
          <>
            <li>
              <Link to="/admin/vender-producto" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faShoppingCart} className="fa-icon" /> <span>Vender Producto</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/ver-pedidos" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faClipboardList} className="fa-icon" /> <span>Mis Pedidos</span>
              </Link>
            </li>
          </>
        )}

        {/* APOYO */}
        {user?.num_rol === 3 && (
          <>
            <li>
              <Link to="/admin/alistar-pedido" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faBox} className="fa-icon" /> <span>Alistar Pedido</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/pedidos-listos" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faCheckCircle} className="fa-icon" /> <span>Pedidos Listos</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/confirmar-pedido" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faThumbsUp} className="fa-icon" /> <span>Confirmar Pedido</span>
              </Link>
            </li>
          </>
        )}

        {/* DELIVERY */}
        {user?.num_rol === 4 && (
          <li>
            <Link to="/admin/recoger-pedido" className="navbar-link" onClick={onLinkClick}>
              <FontAwesomeIcon icon={faHandsHelping} className="fa-icon" /> <span>Recoger Pedido</span>
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default AdminNavbar;
