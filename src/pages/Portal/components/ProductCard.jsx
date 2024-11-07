import React, { useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import bdMercado from '../../../services/bdMercado';
import PesoModal from '../components/peso/PesoModal';
import '../css/ProductCard.css';
import { DataContext } from '../../../context/DataContext';

const ProductCard = ({ product, handleQuantityChange, quantities, onProductAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { data } = useContext(DataContext);

  const handleAddToCart = async (productId, quantity) => {
    let payload = {
      producto_id: productId,
      cantidad: quantity
    };

    if (data && data.user && data.user.related_data) {
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
      const response = await bdMercado.post('/carrito/agregar', payload);
      console.log('Product added to cart:', response.data);
      onProductAdded();  // Llamar a la función onProductAdded para forzar la actualización del carrito
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <div className="product-card">
        <img src={`http://localhost:8000${product.imagen}`} alt={product.nombre} className="product-image" />
        <div className="product-info">
          <h3 className="product-name">{product.nombre}</h3>
          <p className="product-description">{product.descripcion}</p>
          <p className="product-price">S/ {product.precio} {product.tipo === 'peso' ? 'x kg' : 'x un'}</p>
          <p className="product-stock">Stock: {product.stock}</p>
          {product.tipo === 'unidad' && (
            <>
              <input
                type="number"
                min="1"
                className="product-quantity"
                value={quantities[product.id] || 1}
                onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
              />
              <button className="product-button" onClick={() => handleAddToCart(product.id, quantities[product.id] || 1)}>
                Agregar
              </button>
            </>
          )}
          {product.tipo === 'peso' && (
            <button className="product-button" onClick={() => handleOpenModal(product)}>
              Agregar <br /><small>(Seleccionarás tu peso)</small>
            </button>
          )}
        </div>
      </div>
      {isModalOpen && selectedProduct && (
        <PesoModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          productId={selectedProduct.id}
          productName={selectedProduct.nombre}
          productPrice={selectedProduct.precio}
          handleAddToCart={handleAddToCart}
        />
      )}
    </>
  );
};

export default ProductCard;
