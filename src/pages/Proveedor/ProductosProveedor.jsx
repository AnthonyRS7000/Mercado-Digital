import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import bdMercado, { BASE_IMG_URL } from '../../services/bdMercado';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { FaArrowLeft, FaStore } from 'react-icons/fa';
import 'react-lazy-load-image-component/src/effects/blur.css';
import '../../styles/css/ProductosProveedor.css';

// 👇 añadidos para seguir el mismo flujo que Productovista
import { v4 as uuidv4 } from 'uuid';
import PesoModal from '../Portal/components/peso/PesoModal';     // <- ajusta la ruta si difiere
import UnidadModal from '../Portal/components/peso/UnidadModal'; // <- ajusta la ruta si difiere
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';

const ProductosProveedor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { data } = useContext(DataContext);
  const { setCartCount } = useContext(AuthContext);

  // nombre que llega desde la ficha del producto (si venías navegando)
  const provNameFromState = location.state?.provName || '';

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [provName, setProvName] = useState(provNameFromState);

  // feedback en tarjeta
  const [addingIds, setAddingIds] = useState(new Set());
  const [okIds, setOkIds] = useState(new Set());

  // estado del modal { open: bool, tipo: 'peso'|'unidad', prod: objetoProducto }
  const [modal, setModal] = useState({ open: false, tipo: null, prod: null });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await bdMercado.get(`/productos-proveedor/${id}`);
        if (!mounted) return;

        const arr = Array.isArray(data) ? data : [];
        setProductos(arr);

        if (!provNameFromState) {
          const nameFromProducts = arr[0]?.proveedor?.nombre;
          if (nameFromProducts) {
            setProvName(nameFromProducts);
          } else {
            try {
              const r = await bdMercado.get(`/proveedor/${id}`);
              const nameFromEndpoint = r?.data?.nombre || r?.data?.proveedor?.nombre;
              if (nameFromEndpoint) setProvName(nameFromEndpoint);
            } catch { /* noop */ }
          }
        }
      } catch (e) {
        setErr(e?.response?.data?.error || 'No se pudieron cargar los productos.');
        setProductos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [id, provNameFromState]);

  const handleVolver = () => navigate(-1);
  const goDetalle = (productoId) => navigate(`/producto/${productoId}`);

  const titulo = provName ? `Productos de ${provName}` : `Productos del proveedor #${id}`;

  // === Flujo unificado de agregado (igual que Productovista) ===
  const handleAddToCart = async (productId, quantity) => {
    let payload = {
      producto_id: productId,
      cantidad: quantity
    };

    if (data?.user?.related_data) {
      payload.user_id = data.user.related_data.user_id;
    } else {
      let uuid = localStorage.getItem('carrito_uuid');
      if (!uuid) {
        uuid = uuidv4();
        localStorage.setItem('carrito_uuid', uuid);
      }
      payload.uuid = uuid;
    }

    await bdMercado.post('/carrito/agregar', payload);
    setCartCount(prev => prev + 1);
  };

  // abrir modal según tipo
  const abrirModalAgregar = (e, prod) => {
    e.stopPropagation();
    if (Number(prod.stock) <= 0) return;

    if (prod.tipo === 'peso') {
      setModal({ open: true, tipo: 'peso', prod });
    } else {
      setModal({ open: true, tipo: 'unidad', prod });
    }
  };

  // cerrar modal
  const cerrarModal = () => setModal({ open: false, tipo: null, prod: null });

  // llamado por los modales al confirmar
  const confirmarDesdeModal = async ({ productId, quantity = 1 }) => {
    const pid = productId ?? modal.prod?.id;
    if (!pid) return;

    // para feedback en la tarjeta
    setOkIds(prev => { const n = new Set(prev); n.delete(pid); return n; });
    setAddingIds(prev => new Set(prev).add(pid));

    try {
      await handleAddToCart(pid, quantity);

      // mostrar "Agregado!"
      setOkIds(prev => new Set(prev).add(pid));
      setTimeout(() => {
        setOkIds(prev => { const n = new Set(prev); n.delete(pid); return n; });
      }, 2000);
      cerrarModal();
    } catch (error) {
      alert(error?.response?.data?.error || 'No se pudo agregar al carrito.');
    } finally {
      setAddingIds(prev => { const n = new Set(prev); n.delete(pid); return n; });
    }
  };

  if (loading) {
    return (
      <div className="prov-container">
        <header className="prov-header prov-header--centered">
          <button className="btn-back" onClick={handleVolver} aria-label="Volver">
            <FaArrowLeft />
          </button>
          <h1 className="prov-title">{titulo}</h1>
        </header>
        <div className="prov-loading prov-loading--center">
          {/* guía: usar FaStore como spinner */}
          <FaStore className="spinner-store" />
          <span>Cargando productos…</span>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="prov-container">
        <header className="prov-header prov-header--centered">
          <button className="btn-back" onClick={handleVolver} aria-label="Volver">
            <FaArrowLeft />
          </button>
          <h1 className="prov-title">{titulo}</h1>
        </header>
        <div className="prov-empty">
          <p>{err}</p>
          <button className="btn-cta" onClick={handleVolver}>Volver</button>
        </div>
      </div>
    );
  }

  if (!productos.length) {
    return (
      <div className="prov-container">
        <header className="prov-header prov-header--centered">
          <button className="btn-back" onClick={handleVolver} aria-label="Volver">
            <FaArrowLeft />
          </button>
          <h1 className="prov-title">{titulo}</h1>
        </header>
        <div className="prov-empty">
          <p>No se encontraron productos para este proveedor.</p>
          <button className="btn-cta" onClick={handleVolver}>Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="prov-container">
      <header className="prov-header prov-header--centered">
        <button className="btn-back" onClick={handleVolver} aria-label="Volver">
          <FaArrowLeft />
        </button>
        <h1 className="prov-title">{titulo}</h1>
      </header>

      <section className="prov-grid">
        {productos.map((p) => {
          const sinStock = Number(p.stock) <= 0;
          const agregando = addingIds.has(p.id);
          const agregadoOk = okIds.has(p.id);

          return (
            <article
              key={p.id}
              className="prov-card"
              onClick={() => goDetalle(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && goDetalle(p.id)}
            >
              <div className="prov-image">
                <LazyLoadImage
                  src={p.imagen?.startsWith('http') ? p.imagen : `${BASE_IMG_URL}${p.imagen}`}
                  alt={p.nombre}
                  effect="blur"
                  width="100%"
                  height="100%"
                />
              </div>

              <div className="prov-body">
                <h3 className="prov-name" title={p.nombre}>{p.nombre}</h3>

                <div className="prov-meta">
                  <span className="prov-price">S/ {p.precio}</span>
                  {typeof p.stock !== 'undefined' && (
                    <span className={`prov-stock ${sinStock ? 'out' : ''}`}>
                      {sinStock ? 'Sin stock' : `Stock: ${p.stock}`}
                    </span>
                  )}
                </div>

                <div className="prov-tags">
                  <span className="prov-tag">{p.categoria?.nombre || 'Sin categoría'}</span>
                  {p.tipo && (
                    <span className="prov-tag soft">
                      {p.tipo === 'peso' ? 'Por peso' : 'Por unidad'}
                    </span>
                  )}
                </div>

                {/* Acciones */}
                <div className="prov-actions">
                  <button
                    className="btn-add"
                    onClick={(e) => abrirModalAgregar(e, p)}
                    disabled={sinStock || agregando}
                    aria-label="Agregar al carrito"
                  >
                    {agregando ? (
                      <>
                        {/* guía: usar FaStore como spinner */}
                        <FaStore className="btn-add-spinner" />
                        <span>Agregando…</span>
                      </>
                    ) : agregadoOk ? (
                      <span>¡Agregado!</span>
                    ) : (
                      <span>Agregar</span>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* ==== Modales ==== */}
      {modal.open && modal.tipo === 'peso' && modal.prod && (
        <PesoModal
          isOpen={modal.open}
          onClose={cerrarModal}
          productId={modal.prod.id}
          productName={modal.prod.nombre}
          productPrice={modal.prod.precio}
          // si tu PesoModal necesita props extra (stock, unidad mínima, etc) pásalas aquí
          handleAddToCart={({ productId, quantity }) =>
            confirmarDesdeModal({ productId, quantity })
          }
        />
      )}

      {modal.open && modal.tipo === 'unidad' && modal.prod && (
        <UnidadModal
          isOpen={modal.open}
          onClose={cerrarModal}
          productId={modal.prod.id}
          productName={modal.prod.nombre}
          productPrice={modal.prod.precio}
          // puedes pasar un valor por defecto de cantidad desde aquí si tu UnidadModal lo soporta
          handleAddToCart={({ productId, quantity }) =>
            confirmarDesdeModal({ productId, quantity })
          }
        />
      )}
    </div>
  );
};

export default ProductosProveedor;
