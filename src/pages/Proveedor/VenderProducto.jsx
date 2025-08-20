// src/components/VenderProducto.jsx
import React, { useEffect, useState, useContext } from 'react';
import bdMercado, { BASE_IMG_URL } from '../../services/bdMercado';
import { AuthContext } from '../../context/AuthContext';
import RegistrarProducto from './RegistrarProducto';
import EditarProducto from './EditarProducto';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import styles from '../../styles/css/VenderProducto.module.css';

const VenderProducto = () => {
  const { user } = useContext(AuthContext);
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const proveedorId = user?.related_data?.id || user?.related_data?.proveedor_id;
        if (proveedorId) {
          try {
            const respProd = await bdMercado.get(`/productos-proveedor/${proveedorId}`);
            setProductos(respProd.data || []);
          } catch (err) {
            // Si el backend devuelve 404 -> tratamos como "sin productos"
            if (err.response && err.response.status === 404) {
              setProductos([]);
            } else {
              throw err;
            }
          }
        } else {
          setError('No se pudo identificar el proveedor');
        }

        const respCat = await bdMercado.get(`/v1/categorias`);
        setCategorias(respCat.data);
      } catch (e) {
        setError('Error al cargar los productos: ' + (e.message || 'Error desconocido'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const handleDeleteClick = (producto) => setProductoAEliminar(producto);

  const confirmarEliminar = async () => {
    if (!productoAEliminar) return;
    try {
      await bdMercado.delete(`/productos/${productoAEliminar.id}`);
      setProductos(prev => prev.filter(p => p.id !== productoAEliminar.id));
      setProductoAEliminar(null);
    } catch {
      alert('Error al eliminar el producto');
    }
  };

  const cancelarEliminar = () => setProductoAEliminar(null);

  const handleUpdate = (producto, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setProductoAEditar(producto);
    setShowEditModal(true);
  };

  const handleRegister = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleSaveEdit = async (values) => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (v != null) formData.append(k, v);
      });
      await bdMercado.post(`/producto/${productoAEditar.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const id = user?.related_data?.id || user?.related_data?.proveedor_id;
      const resp = await bdMercado.get(`/productos-proveedor/${id}`);
      setProductos(resp.data || []);
      setShowEditModal(false);
      setProductoAEditar(null);
    } catch {
      alert('Error al actualizar el producto');
    } finally {
      setIsUpdating(false);
    }
  };

  if (error) return <div className={styles.error}>{error}</div>;

  // === Loading con ícono giratorio ===
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon
          icon={faStore}
          spin
          size="3x"
          className={styles.loadingIcon}
        />
        <p>Cargando productos…</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className="page-title">Productos</h1>
        <button className={styles.createButton} onClick={handleRegister}>
          <Plus size={20} /> Crear Nuevo
        </button>
      </div>

      <div className={styles.card}>
        {productos.length === 0 ? (
          <div className={styles.noProducts}>
            <p>Aún no tienes productos registrados.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Stock</th>
                  <th>Precio</th>
                  <th>Categoría</th>
                  <th>Imagen</th>
                  <th>Descripción</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(prod => (
                  <tr key={prod.id}>
                    <td>{prod.nombre}</td>
                    <td>{prod.stock} {prod.tipo === 'peso' ? 'kg' : 'unid'}</td>
                    <td>S/. {prod.precio}</td>
                    <td>{prod.categoria?.nombre || 'Sin categoría'}</td>
                    <td>
                      {prod.imagen && (
                        <img
                          src={prod.imagen.startsWith('http') ? prod.imagen : `${BASE_IMG_URL}${prod.imagen}`}
                          alt={prod.nombre}
                          className={styles.image}
                          onError={e => { e.target.onerror = null; e.target.src = 'ruta/a/imagen-por-defecto.jpg'; }}
                        />
                      )}
                    </td>
                    <td>{prod.descripcion}</td>
                    <td className={styles.actions}>
                      <div className={styles.actionsContent}>
                        <button className={styles.iconBtn} onClick={e => handleUpdate(prod, e)}>
                          <Edit3 size={16} />
                        </button>
                        <button className={styles.iconBtn} onClick={() => handleDeleteClick(prod)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <RegistrarProducto
          show={showModal}
          handleClose={handleCloseModal}
          refreshProducts={async () => {
            const id = user?.related_data?.id || user?.related_data?.proveedor_id;
            try {
              const resp = await bdMercado.get(`/productos-proveedor/${id}`);
              setProductos(resp.data || []);
            } catch (err) {
              if (err.response && err.response.status === 404) {
                setProductos([]);
              }
            }
          }}
        />
      )}

      {productoAEliminar && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>¿Eliminar producto?</h2>
            <p>Estás a punto de eliminar <strong>{productoAEliminar.nombre}</strong>. ¿Deseas continuar?</p>
            <div className={styles.modalActions}>
              <button onClick={confirmarEliminar} className={styles.confirmBtn}>Sí, eliminar</button>
              <button onClick={cancelarEliminar} className={styles.cancelBtn}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <EditarProducto
          show={showEditModal}
          producto={productoAEditar}
          categorias={categorias}
          onClose={() => { setShowEditModal(false); setProductoAEditar(null); }}
          onSave={handleSaveEdit}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};

export default VenderProducto;
