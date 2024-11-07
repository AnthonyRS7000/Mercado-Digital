import React, { useEffect, useState } from 'react';
import bdMercado from '../../../services/bdMercado';
import ProductCard from './ProductCard';
import { useOutletContext } from 'react-router-dom';
import '../css/ProductList.css';

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [searchTerm] = useOutletContext();

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

  const filteredProducts = products.filter(product =>
    (category === null || product.categoria_id === category) &&
    (!searchTerm || product.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="product-list">
      {filteredProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          handleQuantityChange={handleQuantityChange}
          quantities={quantities}
        />
      ))}
    </div>
  );
};

export default ProductList;
