import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ClientNavbar from '../components/ClientNavbar';

const ClientLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div>
      <ClientNavbar onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
      <Outlet context={[searchTerm, selectedCategory, setSelectedCategory]} />
    </div>
  );
};

export default ClientLayout;
