import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import bdMercado from '../../../../services/bdMercado';
import { AuthContext } from '../../../../context/AuthContext';
import QuantityModal from './QuantityModal';
import LoginModal from '../../LoginModal'; // Importar LoginModal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import '../../css/Carrito.css';

const Carrito = () => {
  const [cart, setCart] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { user, setCartCount } = useContext(AuthContext);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      let response;
      if (user && user.related_data) {
        const userId = user.related_data.user_id;
        response = await bdMercado.get(`/carrito/user/${userId}`);
      } else {
        const uuid = localStorage.getItem('carrito_uuid');
        if (uuid) {
          response = await bdMercado.get(`/carrito/uuid/${uuid}`);
        }
      }
  
      if (response) {
        setCart(response.data);
        setCartCount(response.data.productos.length); // Actualiza el contador global del carrito
      } else {
        setCart({ productos: [] });
        setCartCount(0); // Actualiza el contador global del carrito
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ productos: [] });
      setCartCount(0); // Actualiza el contador global del carrito
    }
  };
  
  const handleEmptyCart = async () => {
    try {
      if (user && user.related_data) {
        const userId = user.related_data.user_id;
        await bdMercado.post('/carrito/vaciar', { user_id: userId });
      } else {
        const uuid = localStorage.getItem('carrito_uuid');
        if (uuid) {
          await bdMercado.post('/carrito/vaciar', { uuid });
        }
      }
      fetchCart();
    } catch (error) {
      console.error('Error emptying cart:', error);
    }
  };

  const handlePlaceOrder = () => {
    if (!user) {
      setLoginModalOpen(true);
    } else {
      navigate('/pedido');
    }
  };

  const handleUpdateQuantity = async (carritoId, productId, newQuantity) => {
    try {
      if (newQuantity === '') return; // No hacer nada si el campo está vacío
      await bdMercado.put(`/carrito-actualizar/${carritoId}/${productId}`, { cantidad: parseFloat(newQuantity) });
  
      // Actualizar directamente el estado del carrito en el frontend
      setCart((prevCart) => ({
        ...prevCart,
        productos: prevCart.productos.map((producto) =>
          producto.id === productId ? { ...producto, cantidad: newQuantity } : producto
        ),
        cantidad_total: prevCart.productos.reduce(
          (acc, producto) => acc + (producto.id === productId ? parseFloat(newQuantity) : producto.cantidad),
          0
        ),
        total_precio: prevCart.productos.reduce(
          (acc, producto) => acc + (producto.id === productId ? parseFloat(newQuantity) * producto.producto.precio : producto.cantidad * producto.producto.precio),
          0
        ),
      }));
  
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };
  

  const handleRemoveProduct = async (carritoId, productId) => {
    try {
      await bdMercado.delete(`/carrito-eliminar/${carritoId}/${productId}`);
      // Actualiza el carrito en el estado
      fetchCart(); 
      // Actualiza el contador global del carrito
      setCartCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };
  

  const handleChangeQuantity = (productId, value) => {
    setCart((prevCart) => ({
      ...prevCart,
      productos: prevCart.productos.map((producto) =>
        producto.id === productId ? { ...producto, cantidad: value } : producto
      ),
    }));
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  if (!cart) {
    return <div>Cargando...</div>;
  }

  if (!cart.productos || cart.productos.length === 0) {
    return (
      <div className="empty-cart-container">
        <FontAwesomeIcon icon={faShoppingCart} className="empty-cart-icon" />
        <p>Tu carrito está vacío.</p>
        <p>Empieza a hacer tus compras <a href="/">aquí</a>.</p>
        {!user && <p>o</p>}
        {!user && <p>Inicia sesión para ver tu carrito.</p>}
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <h2>Carrito {user ? 'de Usuario' : 'de Invitado'}</h2>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Detalles del Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cart.productos.map(({ id, cantidad, total, producto }) => (
            <tr key={id}>
              <td>
                <img src={`http://localhost:8000${producto.imagen}`} alt={producto.nombre} className="product-image" />
              </td>
              <td>
                <p className="nombre">Nombre: {producto.nombre}</p>
                <p>Precio unitario: {producto.precio}</p>
              </td>
              <td>
                <p>{producto.precio}</p>
              </td>
              <td>
                <input
                  type="number"
                  step={producto.tipo === 'peso' ? "0.01" : "1"}
                  min="0"
                  value={cantidad}
                  onClick={() => setSelectedProduct({ id, cantidad, producto, carrito_id: cart.carrito_id })}
                  onChange={(e) => handleChangeQuantity(id, e.target.value)}
                />
                <p>{producto.tipo === 'peso' ? 'kilogramos' : 'unidades'}</p>
              </td>
              <td>
                <p>{total}</p>
              </td>
              <td>
                <button className="btn eliminar" onClick={() => handleRemoveProduct(cart.carrito_id, producto.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="total-container">
        <p>Total en kilos: {cart.cantidad_total} {cart.cantidad_total > 1 ? 'kilogramos' : 'unidad'}</p>
        <p>Total precio: {cart.total_precio}</p>
        <button className="btn vaciar" onClick={handleEmptyCart}>Vaciar Carrito</button>
        <button className="btn pedido" onClick={handlePlaceOrder}>Hacer Pedido</button>
      </div>
      {selectedProduct && (
        <QuantityModal
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          onUpdateQuantity={(carritoId, productId, newQuantity) => handleUpdateQuantity(carritoId, productId, newQuantity)}
        />
      )}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </div>
  );
};

export default Carrito;
