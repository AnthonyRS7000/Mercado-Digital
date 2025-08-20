import React, { useEffect, useState } from 'react';
import bdMercado from '../services/bdMercado';
import './css/CategoryNavbar.css';

const CategoryNavbar = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await bdMercado.get('/v1/categorias');
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleSelect = (id) => {
    setActiveId(id);
    onCategorySelect(id);
  };

  return (
    <div className="category-navbar">
      <h3>Nuestras categorías</h3>
      <ul>
        <li
          className={activeId === null ? 'active' : ''}
          onClick={() => handleSelect(null)}
        >
          Todas las categorías
        </li>
        {categories.map(cat => (
          <li
            key={cat.id}
            className={activeId === cat.id ? 'active' : ''}
            onClick={() => handleSelect(cat.id)}
          >
            {cat.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryNavbar;
