import React, { useEffect, useState } from 'react';
import bdMercado from '../services/bdMercado';
import './css/CategoryNavbar.css';

const CategoryNavbar = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await bdMercado.get('/v1/categorias');
        setCategories(response.data);  // Asegúrate de que accedes a response.data
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleShowAllCategories = () => {
    onCategorySelect(null);  // Pasar null para mostrar todos los productos
  };

  return (
    <div className="category-navbar">
      <h3>Nuestras categorías</h3>
      <ul>
        {/* Opción para mostrar todas las categorías */}
        <li onClick={handleShowAllCategories}>Todas las categorías</li>
        {categories.map(category => (
          <li key={category.id} onClick={() => onCategorySelect(category.id)}>
            {category.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryNavbar;
