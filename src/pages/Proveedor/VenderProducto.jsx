import React, { useEffect, useState, useContext } from 'react';
import bdMercado, { BASE_IMG_URL } from '../../services/bdMercado';
import { AuthContext } from '../../context/AuthContext';
import RegistrarProducto from './RegistrarProducto';
import EditarProducto from './EditarProducto';
import { Plus, Edit3, PowerOff, Power } from 'lucide-react';
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
  const [productoADesactivar, setProductoADesactivar] = useState(null);
  const [productoAActivar, setProductoAActivar] = useState(null);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [categorias, setCategorias] = useState([]);

  const fetchProductos = async () => {
    const proveedorId = user?.related_data?.id || user?.related_data?.proveedor_id;
    if (!proveedorId) return;
    try {
      const resp = await bdMercado.get(`/productos-proveedor/${proveedorId}`);
      // Activos primero, desactivados al final
      const ordenados = [...(resp.data || [])].sort((a, b) => b.estado - a.estado);
      setProductos(ordenados);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setProductos([]);
      }
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchProductos();
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

  // === Desactivar producto ===
  const handleDeactivateClick = (producto) => setProductoADesactivar(producto);
  const confirmarDesactivar = async () => {
    if (!productoADesactivar) return;
    try {
      await bdMercado.put(`/productos/desactivar/${productoADesactivar.id}`);
      await fetchProductos();
      setProductoADesactivar(null);
    } catch {
      alert('Error al marcar como no disponible');
    }
  };
  const cancelarDesactivar = () => setProductoADesactivar(null);

  // === Activar producto ===
  const handleActivateClick = (producto) => setProductoAActivar(producto);
  const confirmarActivar = async () => {
    if (!productoAActivar) return;
    try {
      await bdMercado.put(`/productos/activar/${productoAActivar.id}`);
      await fetchProductos();
      setProductoAActivar(null);
    } catch {
      alert('Error al activar el producto');
    }
  };
  const cancelarActivar = () => setProductoAActivar(null);

  // === Editar producto ===
  const handleUpdate = (producto, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setProductoAEditar(producto);
    setShowEditModal(true);
  };

  const handleRegister = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

const handleSaveEdit = async (formData) => {
  console.log("🔴 handleSaveEdit - Recibido FormData:");
  
  // Mostrar contenido del FormData recibido
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: [FILE] ${value.name} (${value.size} bytes, ${value.type})`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }

  setIsUpdating(true);
  try {
    console.log("🔴 handleSaveEdit - Enviando PUT a:", `/actualizarelproducto/${productoAEditar.id}`);
    
    // 👇 CORRECCIÓN: usar PUT y endpoint correcto
    const response = await bdMercado.post(`/actualizarelproducto/${productoAEditar.id}`, formData, {
      headers: { 
        "Content-Type": "multipart/form-data"
      }
    });
    
    console.log("🔴 handleSaveEdit - Respuesta del servidor:", response.data);
    
    await fetchProductos();
    setShowEditModal(false);
    setProductoAEditar(null);
    
    console.log("🔴 handleSaveEdit - Actualización completada exitosamente");
  } catch (error) {
    console.error("🔴 handleSaveEdit - Error:", error);
    console.error("🔴 handleSaveEdit - Error response:", error.response?.data);
    alert('Error al actualizar el producto: ' + (error.response?.data?.message || error.message));
  } finally {
    setIsUpdating(false);
  }
};

  if (error) return <div className={styles.error}>{error}</div>;

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faStore} spin size="3x" className={styles.loadingIcon} />
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
                  <tr key={prod.id} className={prod.estado === 0 ? styles.disabledRow : ''}>
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
                        {prod.estado === 1 ? (
                          <button
                            className={styles.iconBtn}
                            onClick={() => handleDeactivateClick(prod)}
                            title="Marcar como no disponible"
                          >
                            <PowerOff size={16} />
                          </button>
                        ) : (
                          <button
                            className={styles.iconBtn}
                            onClick={() => handleActivateClick(prod)}
                            title="Activar producto"
                          >
                            <Power size={16} color="green" />
                          </button>
                        )}
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
          refreshProducts={fetchProductos}
        />
      )}

      {/* Modal desactivar */}
      {productoADesactivar && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>¿Marcar producto como no disponible?</h2>
            <p>Estás a punto de marcar <strong>{productoADesactivar.nombre}</strong> como <b>NO disponible</b>. ¿Estás seguro?</p>
            <div className={styles.modalActions}>
              <button onClick={confirmarDesactivar} className={styles.confirmBtn}>Sí, marcar como no disponible</button>
              <button onClick={cancelarDesactivar} className={styles.cancelBtn}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal activar */}
      {productoAActivar && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>¿Activar producto?</h2>
            <p>Vas a volver a activar <strong>{productoAActivar.nombre}</strong>. Estará disponible para la venta.</p>
            <div className={styles.modalActions}>
              <button onClick={confirmarActivar} className={styles.confirmBtn}>Sí, activar</button>
              <button onClick={cancelarActivar} className={styles.cancelBtn}>Cancelar</button>
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
