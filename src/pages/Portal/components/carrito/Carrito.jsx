import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import bdMercado from '../../../../services/bdMercado';
import { AuthContext } from '../../../../context/AuthContext';
import QuantityModal from './QuantityModal';
import LoginModal from '../../LoginModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faMinus, faPlus, faTrash, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import styles from '../../css/Carrito.module.css';

const Carrito = ({ hideFooterOnDesktop }) => {
  const [cart, setCart] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const { user, cartCount, setCartCount, cartRefreshTrigger, guestUuid } = useContext(AuthContext);
  const navigate = useNavigate();

  // Traer carrito
  const fetchCart = async () => {
    try {
      let response;
      if (user?.related_data) {
        const userId = user.related_data.user_id;
        response = await bdMercado.get(`/carrito/user/${userId}`);
      } else {
        if (guestUuid) response = await bdMercado.get(`/carrito/uuid/${guestUuid}`);
      }
      if (response?.data) {
        setCart(response.data);
        setCartCount(response.data.productos.length);
      } else {
        setCart({ productos: [] });
        setCartCount(0);
      }
    } catch (error) {
      setCart({ productos: [] });
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, [user, guestUuid, cartRefreshTrigger]);

  // Lógica para el botón siguiente
  const handlePlaceOrder = () => {
    if (!user) setLoginModalOpen(true);
    else navigate('/pedido');
  };

  // Actualizar cantidad
  const handleUpdateQuantity = async (carritoId, productId, newQuantity) => {
    try {
      if (newQuantity === '' || newQuantity <= 0) return;
      await bdMercado.put(`/carrito-actualizar/${carritoId}/${productId}`, { cantidad: parseFloat(newQuantity) });
      fetchCart();
    } catch (error) {}
  };

  // Eliminar producto
  const handleRemoveProduct = async (carritoId, productId) => {
    try {
      await bdMercado.delete(`/carrito-eliminar/${carritoId}/${productId}`);
      fetchCart();
    } catch (error) {}
  };

  // Responsive: solo muestra el footer si hay productos y corresponde (según tamaño)
  const shouldShowFooter =
    cart?.productos?.length > 0 &&
    (!hideFooterOnDesktop || window.innerWidth < 900);

  // Loader
  if (!cart) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faShoppingCart} spin size="3x" className={styles.icon} />
        <p>Cargando tu carrito...</p>
      </div>
    );
  }

  // Carrito vacío
  if (!cart.productos || cart.productos.length === 0) {
    return (
      <div className={styles.emptyCartContainer}>
        <FontAwesomeIcon icon={faShoppingCart} className={styles.emptyCartIcon} />
        <p>Tu carrito está vacío.</p>
        <button className={styles.backHomeBtn} onClick={() => navigate('/')}>Ir al catálogo</button>
        {!user && <p>Inicia sesión para ver tu carrito guardado.</p>}
      </div>
    );
  }

  return (
    <div className={styles.cartAppContainer}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span>&larr;</span>
        </button>
        <h2>Mi carrito</h2>
        <span className={styles.itemsCount}>({cart.productos.length})</span>
      </div>

      <div className={styles.cartProducts}>
        {cart.productos.map(({ id, cantidad, producto }) => (
          <div className={styles.cartItem} key={id}>
            <div className={styles.productImgBox} style={{ background: '#f6fafd' }}>
              <img src={`http://localhost:8000${producto.imagen}`} alt={producto.nombre} />
            </div>
            <div className={styles.itemDetails}>
              <span className={styles.productName}>{producto.nombre}</span>
              <span className={styles.productDesc}>
                {producto.tipo === 'peso' ? 'Producto a peso' : 'Producto por unidad'}
              </span>
              <span className={styles.productPrice}>S/. {producto.precio}</span>
              <span className={styles.productSubtotal}>
                Subtotal: <strong>S/. {(producto.precio * cantidad).toFixed(2)}</strong>
              </span>
            </div>
            {/* Botones según tipo */}
            {producto.tipo === 'unidad' ? (
              <div className={styles.qtyBox}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => handleUpdateQuantity(cart.carrito_id, producto.id, Math.max(Number(cantidad) - 1, 1))}
                  disabled={Number(cantidad) <= 1}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span className={styles.qtyNum}>{cantidad}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => handleUpdateQuantity(cart.carrito_id, producto.id, Number(cantidad) + 1)}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            ) : (
              <div className={styles.qtyBox}>
                <span className={styles.qtyNum}>{cantidad}</span>
                <button
                  className={styles.qtyBtn}
                  title="Actualizar cantidad"
                  onClick={() => setSelectedProduct({
                    ...producto, 
                    tipo: producto.tipo,
                    cantidad,
                    carritoId: cart.carrito_id,
                    id: producto.id
                  })}
                >
                  <FontAwesomeIcon icon={faSyncAlt} />
                </button>
              </div>
            )}
            <button
              className={styles.removeBtn}
              onClick={() => handleRemoveProduct(cart.carrito_id, producto.id)}
              title="Eliminar"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        ))}
      </div>

      {/* FOOTER COMPLETO */}
      {shouldShowFooter && (
        <div className={styles.cartFooter}>
          <div className={styles.deliveryBox}>
            <span>Delivery</span>
            <span>Envío gratis por compras mayores a S/ 100</span>
          </div>
          <div className={styles.totalRow}>
            <span>Total</span>
            <span className={styles.cartTotal}>S/. {cart.total_precio.toFixed(2)}</span>
          </div>
          <button className={styles.nextBtn} onClick={handlePlaceOrder}>
            Siguiente
          </button>
        </div>
      )}

      {/* Modales */}
      {selectedProduct && (
        <QuantityModal
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          onUpdateQuantity={handleUpdateQuantity}
        />
      )}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </div>
  );
};

export default Carrito;
