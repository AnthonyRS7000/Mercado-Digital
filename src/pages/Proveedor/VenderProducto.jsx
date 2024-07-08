import React, { useEffect, useState, useContext } from 'react';
import bdMercado from '../../services/bdMercado';
import { AuthContext } from '../../context/AuthContext';
import RegistrarProducto from './RegistrarProducto';
import '../../styles/css/VenderProducto.css';

const VenderProducto = () => {
  const { user } = useContext(AuthContext);
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await bdMercado.get(`/productos-proveedor/${user.related_data.id}`);
        setProductos(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (user && user.related_data) {
      fetchProductos();
    }
  }, [user]);

  const handleDelete = async (id) => {
    try {
      await bdMercado.delete(`/productos/${id}`);
      setProductos(productos.filter((producto) => producto.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleUpdate = (id) => {
    console.log('Actualizar producto con ID:', id);
  };

  const handleRegister = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const refreshProducts = async () => {
    try {
      const response = await bdMercado.get(`/productos-proveedor/${user.related_data.id}`);
      setProductos(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div className="vender-producto-container">
      <h1>TUS PRODUCTOS</h1>
      <button className="btn btn-primary register-btn" onClick={handleRegister}>Registrar Producto</button>
      <table className="productos-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Imagen</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.nombre}</td>
              <td>{producto.stock}</td>
              <td>{producto.precio}</td>
              <td>{producto.categoria.nombre}</td>
              <td>
                <img src={`http://127.0.0.1:8000${producto.imagen}`} alt={producto.nombre} className="producto-imagen" />
              </td>
              <td>{producto.descripcion}</td>
              <td>
                <button className="btn btn-secondary update-btn" onClick={() => handleUpdate(producto.id)}>Actualizar</button>
                <button className="btn btn-danger delete-btn" onClick={() => handleDelete(producto.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <RegistrarProducto show={showModal} handleClose={handleCloseModal} refreshProducts={refreshProducts} />
    </div>
  );
};

export default VenderProducto;
