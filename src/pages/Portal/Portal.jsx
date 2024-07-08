import React, { useState } from 'react';
import CategoryNavbar from '../../components/CategoryNavbar';
import ProductList from './components/ProductList';
import './css/Portal.css';

const Portal = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="portal">
      <CategoryNavbar onCategorySelect={handleCategorySelect} />
      <div className="portal-content">
        <ProductList category={selectedCategory} />
      </div>
    </div>
  );
};

export default Portal;
