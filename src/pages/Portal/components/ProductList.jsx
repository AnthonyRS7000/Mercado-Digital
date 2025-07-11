import React, { useEffect, useState, useContext } from 'react';
import bdMercado from '../../../services/bdMercado';
import ProductCard from './ProductCard';
import { AuthContext } from '../../../context/AuthContext'; // 👈 AGREGA useContext y AuthContext
import { useOutletContext } from 'react-router-dom';
import '../css/ProductList.css';
import FloatingCart from './FloatingCart';


const ProductList = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [searchTerm] = useOutletContext();

  // 👇 OBTÉN cartCount DEL CONTEXTO
  const { cartCount } = useContext(AuthContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await bdMercado.get('/productos');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
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

  const filteredProducts = products.filter(product =>
    (category === null || product.categoria_id === category) &&
    (!searchTerm || product.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="product-list">
            {loading ? (
              <div className="loading-container">
                <div
                  className="spinner-border"
                  role="status"
                  style={{ width: '3rem', height: '3rem', borderWidth: '4px', color: '#7b1e3d' }}
                ></div>
                <p className="mt-3 text-danger fw-semibold">Cargando productos...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              handleQuantityChange={handleQuantityChange}
              quantities={quantities}
            />
          ))
        ) : (
          <p className="text-center w-100 mt-3">No se encontraron productos.</p>
        )}
      </div>
      {/* Carrito flotante, SIEMPRE FUERA DEL GRID */}
      <FloatingCart count={cartCount || 0} />
    </>
  );
};

export default ProductList;
