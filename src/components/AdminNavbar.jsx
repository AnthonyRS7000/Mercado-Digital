import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart, faBox, faShippingFast, faUserPlus, faMotorcycle,
  faUserFriends, faClipboardList, faCheckCircle, faHandsHelping, faThumbsUp
} from '@fortawesome/free-solid-svg-icons';
import '../styles/css/AdminNavbar.css';

const AdminNavbar = ({ isOpen, onLinkClick }) => {
  const { user } = useContext(AuthContext);

  return (
    <div className={`admin-navbar ${isOpen ? 'open' : ''}`}>
      <div className="admin-navbar-title">
        Mercado Central
      </div>
      <ul className="admin-navbar-menu">
        {/* ADMIN - Puede ver TODO */}
        {user?.num_rol === 20 && (
          <>
            <li>
              <NavLink to="/admin/solicitudes" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faUserPlus} className="fa-icon" /> <span>Aceptar Solicitudes</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/vender-producto" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faShoppingCart} className="fa-icon" /> <span>Vender Producto</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/registrar-proveedor" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faUserPlus} className="fa-icon" /> <span>Registrar Proveedor</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/registrar-delivery" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faMotorcycle} className="fa-icon" /> <span>Registrar Delivery</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/registrar-personal" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faUserFriends} className="fa-icon" /> <span>Registrar Personal</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/ver-pedidos" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faClipboardList} className="fa-icon" /> <span>Mis Pedidos</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/alistar-pedido" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faBox} className="fa-icon" /> <span>Alistar Pedido</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/confirmar-pedido" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faThumbsUp} className="fa-icon" /> <span>Confirmar Pedido</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/recoger-pedido" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faHandsHelping} className="fa-icon" /> <span>Recoger Pedido</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/entregar-pedido" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faShippingFast} className="fa-icon" /> <span>Entregar Pedido</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/pedidos-listos" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faCheckCircle} className="fa-icon" /> <span>Pedidos Listos</span>
              </NavLink>
            </li>
          </>
        )}

        {/* PROVEEDOR */}
        {user?.num_rol === 2 && (
          <>
            <li>
              <NavLink to="/admin/vender-producto" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faShoppingCart} className="fa-icon" /> <span>Vender Producto</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/ver-pedidos" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faClipboardList} className="fa-icon" /> <span>Mis Pedidos</span>
              </NavLink>
            </li>
          </>
        )}

        {/* APOYO */}
        {user?.num_rol === 3 && (
          <>
            <li>
              <NavLink to="/admin/alistar-pedido" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faBox} className="fa-icon" /> <span>Alistar Pedido</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/pedidos-listos" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faCheckCircle} className="fa-icon" /> <span>Pedidos Listos</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/confirmar-pedido" className="navbar-link" onClick={onLinkClick}>
                <FontAwesomeIcon icon={faThumbsUp} className="fa-icon" /> <span>Confirmar Pedido</span>
              </NavLink>
            </li>
          </>
        )}

        {/* DELIVERY */}
        {user?.num_rol === 4 && (
          <li>
            <NavLink to="/admin/recoger-pedido" className="navbar-link" onClick={onLinkClick}>
              <FontAwesomeIcon icon={faHandsHelping} className="fa-icon" /> <span>Recoger Pedido</span>
            </NavLink>
          </li>
        )}
      </ul>
    </div>
  );
};

export default AdminNavbar;
