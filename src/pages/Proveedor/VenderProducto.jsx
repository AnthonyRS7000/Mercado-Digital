import React, { useEffect, useState, useContext } from 'react';
import bdMercado from '../../services/bdMercado';
import { AuthContext } from '../../context/AuthContext';
import RegistrarProducto from './RegistrarProducto';
import '../../styles/css/VenderProducto.css';

const VenderProducto = () => {
  const { user } = useContext(AuthContext);
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Verifica la estructura del usuario según tu nuevo AuthContext
        if (user && user.related_data) {
          const proveedorId = user.related_data.id || user.related_data.proveedor_id;
          if (proveedorId) {
            console.log('Fetching products for provider ID:', proveedorId);
            const response = await bdMercado.get(`/productos-proveedor/${proveedorId}`);
            setProductos(response.data);
          } else {
            console.error('No se encontró ID de proveedor en user.related_data:', user.related_data);
            setError('No se pudo identificar el proveedor');
          }
        } else {
          console.error('Usuario no válido o sin datos relacionados:', user);
          setError('Usuario no válido');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Error al cargar los productos: ' + (error.message || 'Error desconocido'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductos();
  }, [user]);

  const handleDelete = async (id, e) => {
    // Detener la propagación del evento para evitar problemas
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await bdMercado.delete(`/productos/${id}`);
        setProductos(productos.filter((producto) => producto.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const handleUpdate = (id, e) => {
    if (e) {
      // Detener la propagación del evento para evitar problemas
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Actualizar producto con ID:', id);
    // Implementar lógica de actualización aquí
    // Por ahora, simplemente mostramos un mensaje
    alert(`Función de actualización para producto ID: ${id} (pendiente de implementar)`);
  };

  const handleRegister = (e) => {
    if (e) {
      e.preventDefault();
    }
    console.log('Intentando abrir modal de registro');
    setShowModal(true);
    console.log('Estado de showModal:', true);
  };

  const handleCloseModal = () => {
    console.log('Cerrando modal');
    setShowModal(false);
  };

  const refreshProducts = async () => {
    console.log('Refrescando productos');
    setIsLoading(true);
    try {
      if (user && user.related_data) {
        const proveedorId = user.related_data.id || user.related_data.proveedor_id;
        if (proveedorId) {
          console.log('Refreshing products for provider ID:', proveedorId);
          const response = await bdMercado.get(`/productos-proveedor/${proveedorId}`);
          setProductos(response.data);
        } else {
          console.error('No se encontró ID de proveedor en refreshProducts');
          setError('No se pudo identificar el proveedor');
        }
      } else {
        console.error('Usuario no válido en refreshProducts');
        setError('Usuario no válido');
      }
    } catch (error) {
      console.error('Error refreshing products:', error);
      setError('Error al actualizar los productos: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  console.log('Estado actual de showModal:', showModal);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="vender-producto-container">
      <h1>TUS PRODUCTOS</h1>
      <button 
        className="btn btn-primary register-btn" 
        onClick={handleRegister}
        disabled={isLoading}
        style={{ cursor: 'pointer' }}
      >
        Registrar Producto
      </button>
      
      {isLoading ? (
        <div className="loading">Cargando productos...</div>
      ) : (
        <div className="table-container">
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
              {productos.length > 0 ? (
                productos.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.nombre}</td>
                    <td>{producto.stock} {producto.tipo === "peso" ? "kg" : "unid"}</td>
                    <td>{producto.precio}</td>
                    <td>{producto.categoria?.nombre || 'Sin categoría'}</td>
                    <td>
                      {producto.imagen && (
                        <img 
                          src={`http://127.0.0.1:8000${producto.imagen}`} 
                          alt={producto.nombre} 
                          className="producto-imagen"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'ruta/a/imagen-por-defecto.jpg'; }}
                        />
                      )}
                    </td>
                    <td>{producto.descripcion}</td>
                    <td>
                      <button 
                        className="btn btn-secondary update-btn" 
                        onClick={(e) => handleUpdate(producto.id, e)}
                        style={{ cursor: 'pointer', margin: '0 5px' }}
                      >
                        Actualizar
                      </button>
                      <button 
                        className="btn btn-danger delete-btn" 
                        onClick={(e) => handleDelete(producto.id, e)}
                        style={{ cursor: 'pointer', margin: '0 5px' }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-products">No hay productos disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {showModal && (
        <RegistrarProducto 
          show={showModal} 
          handleClose={handleCloseModal} 
          refreshProducts={refreshProducts} 
        />
      )}
    </div>
  );
};

export default VenderProducto;