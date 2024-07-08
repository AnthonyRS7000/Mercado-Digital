import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ClientNavbar from '../components/ClientNavbar';

const ClientLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div>
      <ClientNavbar onSearch={handleSearch} />
      <Outlet context={[searchTerm]} />
    </div>
  );
};

export default ClientLayout;
