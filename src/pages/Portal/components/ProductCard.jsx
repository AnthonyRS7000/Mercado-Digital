import React, { useState, useContext } from 'react';
import PesoModal from '../components/peso/PesoModal';
import UnidadModal from '../components/peso/UnidadModal';
import '../css/ProductCard.css';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// Lazy load image
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const ProductCard = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { user, guestUuid, setCartRefreshTrigger } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleCardClick = () => {
    navigate(`/producto/${product.id}`);
  };

  return (
    <>
      <div className="product-card-wrapper">
        <div className="product-card" onClick={handleCardClick}>
          {/* Imagen siempre centrada y ocupando el máximo espacio disponible */}
          <div className="product-image-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            minHeight: '110px'
          }}>
            <LazyLoadImage
              src={`https://mercado-backend${product.imagen}`}
              alt={product.nombre}
              effect="blur"
              className="product-image"
            />
          </div>

          {/* Info del producto */}
          <div className="product-info">
            <h3 className="product-name">{product.nombre}</h3>
            <p className="product-description">{product.descripcion}</p>
            <p className="product-price">
              S/ {product.precio} {product.tipo === 'peso' ? 'x kg' : 'x ud'}
            </p>
            <button
              className="product-button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenModal(product);
              }}
            >
              Agregar <br />
              <small className="hide-on-mobile">
                {product.tipo === 'peso'
                  ? '(Seleccionarás tu peso)'
                  : '(Seleccionarás unidades)'}
              </small>
            </button>
          </div>
        </div>
      </div>

      {/* Modal para productos por peso */}
      {isModalOpen && selectedProduct && selectedProduct.tipo === 'peso' && (
        <PesoModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          productId={selectedProduct.id}
          productName={selectedProduct.nombre}
          productPrice={selectedProduct.precio}
          guestUuid={guestUuid}
          setCartRefreshTrigger={setCartRefreshTrigger}
          user={user}
        />
      )}

      {/* Modal para productos por unidad */}
      {isModalOpen && selectedProduct && selectedProduct.tipo === 'unidad' && (
        <UnidadModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          productId={selectedProduct.id}
          productName={selectedProduct.nombre}
          productPrice={selectedProduct.precio}
          guestUuid={guestUuid}
          setCartRefreshTrigger={setCartRefreshTrigger}
          user={user}
        />
      )}
    </>
  );
};

export default ProductCard;
