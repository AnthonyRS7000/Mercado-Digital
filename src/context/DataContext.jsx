import React, { createContext, useState, useEffect } from 'react';

export const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('data');
    return savedData ? JSON.parse(savedData) : null;
  });

  const saveData = (newData) => {
    setData(newData);
    localStorage.setItem('data', JSON.stringify(newData));
  };

  useEffect(() => {
    const storedData = localStorage.getItem('data');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  return (
    <DataContext.Provider value={{ data, saveData }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;