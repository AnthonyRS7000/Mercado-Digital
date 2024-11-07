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
    console.log('Saved data to localStorage:', newData);
  };

  useEffect(() => {
    const storedData = localStorage.getItem('data');
    if (storedData) {
      console.log('Loaded data from localStorage:', JSON.parse(storedData));
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
