import React, { useEffect, useState } from 'react';
import bdMercado from '../services/bdMercado';
import './css/CategoryNavbar.css';

const CategoryNavbar = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await bdMercado.get('/v1/categorias');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="category-navbar">
      <h3>Nuestras categorías</h3>
      <ul>
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
