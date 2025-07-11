import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaMinus, FaPlus, FaArrowLeft, FaStore } from 'react-icons/fa';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import '../css/productovista.css';
import PesoModal from '../components/peso/PesoModal';
import UnidadModal from '../components/peso/UnidadModal';
import { DataContext } from '../../../context/DataContext';
import { AuthContext } from '../../../context/AuthContext';
// 👉 Lazy load image
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const Productovista = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');
  const navigate = useNavigate();
  const { data } = useContext(DataContext);
  const { setCartCount } = useContext(AuthContext);

  useEffect(() => {
    axios.get(`https://mercado-backend/api/productos-uno/${id}`)
      .then(res => {
        setProducto(res.data.producto);
        setRelacionados(res.data.relacionados);
      })
      .catch(err => console.error('Error cargando producto:', err));
  }, [id]);

  const disminuirCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  const aumentarCantidad = () => {
    setCantidad(cantidad + 1);
  };

  const handleVolverAtras = () => navigate(-1);

  const handleOpenModal = () => setIsModalOpen(true);

  const handleCloseModal = () => setIsModalOpen(false);

  const mostrarConfirmacion = (mensaje) => {
    setMensajeConfirmacion(mensaje);
    setTimeout(() => setMensajeConfirmacion(''), 2500);
  };

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

    try {
      await axios.post('http://localhost:8000/api/carrito/agregar', payload);
      setCartCount(prev => prev + 1);
      mostrarConfirmacion('Producto agregado al carrito');
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    }
  };

  const agregarAlCarrito = () => {
    if (producto.tipo === 'peso') {
      handleOpenModal();
    } else {
      handleAddToCart(producto.id, cantidad);
    }
  };

  const navegarAProveedor = () => {
    // Esta función se implementará más adelante para navegar a la vista del proveedor
    // navigate(`/proveedor/${producto.proveedor?.id}`);
  };

  if (!producto) {
    return (
      <div className="detalle-cargando">
        <div className="spinner"></div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  const renderCantidad = () => (
    <div className="cantidad-container">
      <button className="cantidad-btn menos" onClick={disminuirCantidad} disabled={cantidad <= 1}>
        <FaMinus />
      </button>
      <span className="cantidad-numero">{cantidad}</span>
      <button className="cantidad-btn mas" onClick={aumentarCantidad}>
        <FaPlus />
      </button>
    </div>
  );

  return (
    <div className="producto-vista-container">
      {/* Versión desktop */}
      <div className="producto-vista-desktop">
        <div className="producto-imagen-container">
          <LazyLoadImage
            src={producto.imagen?.startsWith('http')
              ? producto.imagen
              : `http://localhost:8000${producto.imagen}`}
            alt={producto.nombre}
            effect="blur"
            width={350}
            height={350}
            className="producto-imagen"
          />
        </div>
        
        <div className="producto-info">
          <h2 className="producto-titulo">{producto.nombre}</h2>
          <div className="categoria-container">
            <span className="categoria">
              <span className="estrella">★</span> {producto.categoria?.nombre || 'Hamburguesas'}
            </span>
          </div>
          
          <div className="producto-precios">
            <span className="precio-actual">S/ {producto.precio}</span>
            {producto.precio_original && (
              <span className="precio-tachado">S/ {producto.precio_original}</span>
            )}
          </div>
          
          <p className="producto-descripcion">{producto.descripcion}</p>

          {producto.tipo === 'peso' && (
            <p className="peso-indicacion">Este producto se vende por peso. Podrás elegir la cantidad exacta que desees.</p>
          )}
          
          <div className="acciones-container">
            {producto.tipo === 'unidad' && renderCantidad()}
            <button className="agregar-btn" onClick={agregarAlCarrito}>
              Agregar <FaShoppingCart className="carrito-icono" />
            </button>
          </div>
            {mensajeConfirmacion && <div className="toast-confirmacion">{mensajeConfirmacion}</div>}
        </div>
        
        <div className="acciones-superiores">
          <button onClick={handleVolverAtras} className="volver-btn">
            <FaArrowLeft />
          </button>
          <button onClick={navegarAProveedor} className="proveedor-btn">
            <FaStore className="proveedor-icono" />
            <span className="proveedor-texto">Vendido por {producto.proveedor?.nombre || 'Proveedor'}</span>
          </button>
        </div>
      </div>

      {/* Versión móvil */}
      <div className="producto-vista-mobile">
        <div className="encabezado-mobile">
          <button onClick={handleVolverAtras} className="volver-btn-mobile"><FaArrowLeft /></button>
          <button onClick={navegarAProveedor} className="proveedor-btn-mobile">
            <FaStore className="proveedor-icono-mobile" />
            <span className="proveedor-texto-mobile">Vendido por {producto.proveedor?.nombre || 'Proveedor'}</span>
          </button>
        </div>

        <div className="producto-imagen-mobile">
          <LazyLoadImage
            src={producto.imagen?.startsWith('http')
              ? producto.imagen
              : `http://localhost:8000${producto.imagen}`}
            alt={producto.nombre}
            effect="blur"
            width={250}
            height={250}
          />
        </div>

        <div className="producto-contenido-mobile">
          <h2 className="producto-titulo-mobile">{producto.nombre}</h2>
          <div className="categoria-mobile">
            <span className="estrella-mobile">★</span> {producto.categoria?.nombre || 'Hamburguesas'}
          </div>

          <div className="precios-mobile">
            <span className="precio-actual-mobile">S/ {producto.precio}</span>
            {producto.precio_original && (
              <span className="precio-tachado-mobile">S/ {producto.precio_original}</span>
            )}
          </div>

          <p className="descripcion-mobile">{producto.descripcion}</p>

          {producto.tipo === 'peso' && (
            <p className="peso-indicacion-mobile">Este producto se vende por peso. Podrás elegir la cantidad exacta que desees.</p>
          )}

          <div className="acciones-mobile">
            {producto.tipo === 'unidad' && (
              <div className="cantidad-mobile">
                <button className="cantidad-btn-mobile menos-mobile" onClick={disminuirCantidad} disabled={cantidad <= 1}>
                  <FaMinus />
                </button>
                <span className="cantidad-numero-mobile">{cantidad}</span>
                <button className="cantidad-btn-mobile mas-mobile" onClick={aumentarCantidad}>
                  <FaPlus />
                </button>
              </div>
            )}
            <button className="agregar-btn-mobile" onClick={agregarAlCarrito}>
              Agregar <FaShoppingCart className="carrito-icono-mobile" />
            </button>
          </div>

            {mensajeConfirmacion && <div className="toast-confirmacion">{mensajeConfirmacion}</div>}

        </div>
      </div>

      {/* Productos relacionados */}
      {relacionados.length > 0 && (
        <div className="productos-relacionados">
          <h3 className="relacionados-titulo">Productos relacionados</h3>
          <div className="relacionados-grid">
            {relacionados.map(rel => (
              <div key={rel.id} className="relacionado-item" onClick={() => navigate(`/producto/${rel.id}`)}>
                <div className="relacionado-imagen">
                  <LazyLoadImage
                    src={rel.imagen?.startsWith('http') 
                      ? rel.imagen 
                      : `http://localhost:8000${rel.imagen}`}
                    alt={rel.nombre}
                    effect="blur"
                    width={120}
                    height={120}
                  />
                </div>
                <div className="relacionado-info">
                  <p className="relacionado-nombre">{rel.nombre}</p>
                  <span className="relacionado-precio">S/ {rel.precio}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Carrito flotante que redirige a /carrito */}
      <div className="carrito-flotante">
        <button className="carrito-flotante-btn" onClick={() => navigate('/carrito')}>
          <FaShoppingCart />
        </button>
      </div>

      {/* Modal Peso */}
      {isModalOpen && producto.tipo === 'peso' && (
        <PesoModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          productId={producto.id}
          productName={producto.nombre}
          productPrice={producto.precio}
          handleAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default Productovista;
