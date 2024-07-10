import React, { useEffect, useState } from 'react';
import bdMercado from '../../../services/bdMercado';
import PesoModal from '../components/peso/PesoModal';
import '../css/ProductList.css';
import { useOutletContext } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [searchTerm] = useOutletContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await bdMercado.get('/productos');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, quantity) => {
    setQuantities({
      ...quantities,
      [productId]: quantity,
    });
  };

  const handleAddToCart = async (productId, quantity) => {
    let uuid = localStorage.getItem('carrito_uuid');

    // Si no existe un UUID, se crea uno nuevo y se almacena en localStorage
    if (!uuid) {
      uuid = uuidv4();
      localStorage.setItem('carrito_uuid', uuid);
    }

    try {
      const response = await bdMercado.post('/carrito/agregar', {
        producto_id: productId,
        cantidad: quantity,
        uuid: uuid,  // Enviar el UUID con la solicitud
      });
      console.log('Product added to cart:', response.data);

      // Asegurar que el UUID esté correctamente almacenado solo si no existe ya
      if (!localStorage.getItem('carrito_uuid')) {
        localStorage.setItem('carrito_uuid', response.data.uuid);
      }
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

  const filteredProducts = products.filter(product =>
    (category === null || product.categoria_id === category) &&
    (!searchTerm || product.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="product-list">
      {filteredProducts.map(product => (
        <div key={product.id} className="product-card">
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
      ))}
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
    </div>
  );
};

export default ProductList;
