import React, { useEffect, useState, useContext } from 'react';
import bdMercado from '../../../services/bdMercado';
import ProductCard from './ProductCard';
import { AuthContext } from '../../../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import '../css/ProductList.css';
import FloatingCart from './FloatingCart';

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [searchTerm] = useOutletContext();
  const { cartCount } = useContext(AuthContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await bdMercado.get('/productos');
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, quantity) => {
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

  const filteredProducts = products.filter(p =>
    (category == null || p.categoria_id === category) &&
    (!searchTerm || p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      {loading ? (
        <div className="pl-loader-container">
          <FontAwesomeIcon
            icon={faStore}
            spin
            size="3x"
            className="pl-loader-icon"
          />
          <p className="pl-loader-text">Cargando productos…</p>
        </div>
      ) : (
        <div className="product-list">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                handleQuantityChange={handleQuantityChange}
                quantities={quantities}
              />
            ))
          ) : (
            <p className="no-results">No se encontraron productos.</p>
          )}
        </div>
      )}
      <FloatingCart count={cartCount || 0} />
    </>
  );
};

export default ProductList;
