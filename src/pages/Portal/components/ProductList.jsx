import React, { useEffect, useState } from 'react';
import bdMercado from '../../../services/bdMercado';
import '../css/ProductList.css';
import { useOutletContext } from 'react-router-dom';

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([]);
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
            <p className="product-price">S/ {product.precio}</p>
            <p className="product-stock">Stock: {product.stock}</p>
            <button className="product-button">Agregar</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
