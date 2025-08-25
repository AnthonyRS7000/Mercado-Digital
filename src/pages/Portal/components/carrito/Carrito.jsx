import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import bdMercado, { BASE_IMG_URL } from '../../../../services/bdMercado';
import { AuthContext } from '../../../../context/AuthContext';
import QuantityModal from './QuantityModal';
import LoginModal from '../../LoginModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faMinus,
  faPlus,
  faTrash,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../css/Carrito.module.css';

const Carrito = () => {
  const [cart, setCart] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const { user, setCartCount, cartRefreshTrigger, guestUuid } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- refs para controlar debounce, acumuladores y requests por item ---
  const pendingTimersRef = useRef(new Map()); // key: `${carritoId}:${productId}` -> timeoutId
  const inFlightRef = useRef(new Set());      // keys en vuelo
  const deltaBufferRef = useRef(new Map());   // key -> delta acumulado

  const isBusy = (carritoId, productId) => inFlightRef.current.has(`${carritoId}:${productId}`);

  const fetchCart = async () => {
    try {
      let response;
      if (user?.related_data) {
        const userId = user.related_data.user_id;
        response = await bdMercado.get(`/carrito/user/${userId}`);
      } else if (guestUuid) {
        response = await bdMercado.get(`/carrito/uuid/${guestUuid}`);
      }

      if (response?.data) {
        setCart(response.data);
        setCartCount(response.data.productos.length);
      } else {
        setCart({ productos: [] });
        setCartCount(0);
      }
    } catch {
      setCart({ productos: [] });
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, [user, guestUuid, cartRefreshTrigger]);

  const handlePlaceOrder = () => {
    if (!user) setLoginModalOpen(true);
    else navigate('/pedido');
  };

  // -------- Incremento con debounce + acumulación de deltas --------
  const queueIncrement = (carritoId, productId, delta) => {
    const key = `${carritoId}:${productId}`;

    // 1) UI optimista inmediata
    setCart((prev) => {
      if (!prev?.productos) return prev;
      const productos = prev.productos.map((p) => {
        if (p.producto.id !== productId) return p;
        const nuevaCantidad = Math.max(1, Number(p.cantidad) + delta);
        return { ...p, cantidad: nuevaCantidad };
      });
      const total_precio = productos.reduce(
        (acc, p) => acc + Number(p.cantidad) * Number(p.producto.precio),
        0
      );
      return { ...prev, productos, total_precio };
    });

    // 2) Acumular delta
    const current = deltaBufferRef.current.get(key) || 0;
    deltaBufferRef.current.set(key, current + delta);

    // 3) Resetear debounce
    if (pendingTimersRef.current.has(key)) {
      clearTimeout(pendingTimersRef.current.get(key));
    }

    const t = setTimeout(async () => {
      pendingTimersRef.current.delete(key);
      const totalDelta = deltaBufferRef.current.get(key) || 0;
      deltaBufferRef.current.delete(key);
      if (totalDelta === 0) return;

      if (inFlightRef.current.has(key)) return;
      inFlightRef.current.add(key);

      try {
        const { data } = await bdMercado.patch(
          `/carrito-incrementar/${carritoId}/${productId}`,
          { delta: totalDelta } // 👈 aquí enviamos el acumulado
        );

        // 4) Ajuste final con backend
        setCart((prev) => {
          if (!prev?.productos) return prev;
          const productos = prev.productos.map((p) =>
            p.producto.id === productId
              ? { ...p, cantidad: data.item.cantidad, producto: data.item.producto }
              : p
          );
          return {
            ...prev,
            productos,
            total_precio: data?.resumen?.total_precio ?? prev.total_precio,
          };
        });
      } catch {
        fetchCart(); // fallback
      } finally {
        inFlightRef.current.delete(key);
      }
    }, 250);

    pendingTimersRef.current.set(key, t);
  };

  // -------- Mantengo tu PUT para el modal (setear cantidad exacta) --------
  const handleUpdateQuantity = async (carritoId, productId, newQuantity) => {
    try {
      if (newQuantity === '' || Number(newQuantity) <= 0) return;

      // UI optimista
      setCart((prev) => {
        if (!prev?.productos) return prev;
        const productos = prev.productos.map((p) =>
          p.producto.id === productId ? { ...p, cantidad: Number(newQuantity) } : p
        );
        const total_precio = productos.reduce(
          (acc, p) => acc + Number(p.cantidad) * Number(p.producto.precio),
          0
        );
        return { ...prev, productos, total_precio };
      });

      await bdMercado.put(`/carrito-actualizar/${carritoId}/${productId}`, {
        cantidad: parseFloat(newQuantity),
      });
    } catch {
      fetchCart();
    }
  };

  const handleRemoveProduct = async (carritoId, productId) => {
    try {
      await bdMercado.delete(`/carrito-eliminar/${carritoId}/${productId}`);
      fetchCart();
    } catch {}
  };

  const handleVaciarCart = async () => {
    try {
      if (user?.related_data) {
        await bdMercado.post('/carrito/user/vaciar', { user_id: user.related_data.user_id });
      } else if (guestUuid) {
        await bdMercado.post('/carrito/invitado/vaciar', null, {
          params: { uuid: guestUuid },
        });
      }
      fetchCart();
    } catch {}
  };

  const openQuantityModal = ({ producto, cantidad, carritoId }) => {
    setSelectedProduct({
      ...producto,
      cantidad,
      carritoId,
      id: producto.id,
    });
  };

  if (!cart) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faShoppingCart} spin size="3x" className={styles.icon} />
        <p>Cargando tu carrito...</p>
      </div>
    );
  }

  if (!cart.productos || cart.productos.length === 0) {
    return (
      <div className={styles.emptyCartContainer}>
        <FontAwesomeIcon icon={faShoppingCart} className={styles.emptyCartIcon} />
        <p>Tu carrito está vacío.</p>
        <button className={styles.backHomeBtn} onClick={() => navigate('/')}>
          Ir al catálogo
        </button>
        {!user && <p>Inicia sesión para ver tu carrito guardado.</p>}
      </div>
    );
  }

  return (
    <div className={styles.cartMainLayout}>
      <div className={styles.cartProductsCol}>
        <div className={styles.cartAppContainer}>
          <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <span>&larr;</span>
            </button>
            <h2>Mi carrito</h2>
            <span className={styles.itemsCount}>({cart.productos.length})</span>
          </div>

          <div className={styles.cartProducts}>
            {cart.productos.map(({ id, cantidad, producto }) => {
              const cantidadFormatted =
                Number(cantidad) % 1 === 0 ? Number(cantidad).toString() : Number(cantidad);

              return (
                <div className={styles.cartItem} key={id}>
                  <div className={styles.productImgBox} style={{ background: '#f6fafd' }}>
                    <img
                      src={
                        producto.imagen?.startsWith('http')
                          ? producto.imagen
                          : `${BASE_IMG_URL}${producto.imagen}`
                      }
                      alt={producto.nombre}
                    />
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

                  <div className={styles.actionBox}>
                    {producto.tipo === 'unidad' ? (
                      <div className={styles.qtyBoxInline}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() =>
                            queueIncrement(cart.carrito_id, producto.id, -1)
                          }
                          disabled={Number(cantidad) <= 1 || isBusy(cart.carrito_id, producto.id)}
                          title="Disminuir"
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span className={styles.qtyNum}>{cantidadFormatted}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() =>
                            queueIncrement(cart.carrito_id, producto.id, +1)
                          }
                          disabled={isBusy(cart.carrito_id, producto.id)}
                          title="Aumentar"
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                    ) : (
                      <div className={styles.qtyChip}>
                        <span className={styles.qtyNum}>{cantidadFormatted}</span>
                      </div>
                    )}

                    <div className={styles.iconRow}>
                      <button
                        className={`${styles.iconBtn} ${styles.updateBtn}`}
                        title="Actualizar cantidad"
                        onClick={() =>
                          openQuantityModal({ producto, cantidad, carritoId: cart.carrito_id })
                        }
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      <div className={styles.vDivider}></div>

                      <button
                        className={`${styles.iconBtn} ${styles.trashBtn}`}
                        title="Eliminar"
                        onClick={() => handleRemoveProduct(cart.carrito_id, producto.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.footerActions}>
            <button className={styles.clearCartBtn} onClick={handleVaciarCart}>
              Vaciar carrito
            </button>
          </div>
        </div>
      </div>

      <div className={styles.summaryCol}>
        <div className={styles.resumenBox}>
          <div className={styles.deliveryBox}>
            <span>El delivery es totalmente gratis por compras mayores a S/ 100</span>
          </div>
          <div className={styles.totalRow}>
            <span>Total</span>
            <span className={styles.cartTotal}>
              S/. {cart.total_precio ? cart.total_precio.toFixed(2) : '0.00'}
            </span>
          </div>
          <button className={styles.nextBtn} onClick={handlePlaceOrder}>
            Siguiente
          </button>
        </div>
      </div>

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
