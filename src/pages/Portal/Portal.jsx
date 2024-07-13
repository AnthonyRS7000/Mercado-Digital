import React from 'react';
import CategoryNavbar from '../../components/CategoryNavbar';
import ProductList from './components/ProductList';
import './css/Portal.css';
import { useOutletContext } from 'react-router-dom';

const Portal = () => {
  const [searchTerm, selectedCategory, setSelectedCategory] = useOutletContext();

  return (
    <div className="portal">
      <CategoryNavbar onCategorySelect={setSelectedCategory} />
      <div className="portal-content">
        <ProductList category={selectedCategory} searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default Portal;
