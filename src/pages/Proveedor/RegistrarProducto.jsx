import React, { useState, useEffect, useContext } from 'react';
import bdMercado from '../../services/bdMercado';
import { AuthContext } from '../../context/AuthContext';
import styles from '../../styles/css/RegistrarProducto.module.css';

const RegistrarProducto = ({ show, handleClose, refreshProducts }) => {
  const { user } = useContext(AuthContext);
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    stock: '',
    precio: '',
    categoria_id: '',
    tipo: 'peso',
    imagen: null,
    estado: 1,
    proveedor_id: user?.related_data?.id || null,
  });

  useEffect(() => {
    const fetchCategorias = async () => {
      const proveedorId = user?.related_data?.id;
      if (!proveedorId) return;

      try {
        const url = `/proveedores/categorias/${proveedorId}`;
        const response = await bdMercado.get(url);
        setCategorias(response.data || []);
      } catch (error) {
        console.error('Error al obtener las categorías:', error.response?.data || error.message);
      }
    };

    fetchCategorias();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'stock' || name === 'categoria_id') {
      newValue = value ? parseInt(value) : '';
    } else if (name === 'precio') {
      newValue = value ? parseFloat(value) : '';
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      imagen: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    }

    try {
      await bdMercado.post('/productos', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      handleClose();
      refreshProducts();
    } catch (error) {
      console.error('Error al registrar el producto:', error);
    }
  };

  if (!show) return null;

  // NUEVO: cerrar modal al hacer clic fuera del contenido
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains(styles.modal)) {
      handleClose();
    }
  };

  return (
    <div className={styles.modal} onClick={handleBackdropClick}>
      <div className={styles['modal-content']}>
        <span className={styles['close-button']} onClick={handleClose}>&times;</span>
        <h2>Registrar Producto</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles['form-group']}>
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles['form-group']}>
            <label htmlFor="stock">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
            />
            <small className={styles['stock-hint']}>Ingrese la cantidad de kilogramos o unidades</small>
          </div>
          <div className={styles['form-group']}>
            <label htmlFor="precio">Precio</label>
            <input
              type="number"
              id="precio"
              step="0.01"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles['form-group']}>
            <label htmlFor="categoria_id">Categoría</label>
            <select
              id="categoria_id"
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una categoría</option>
              {Array.isArray(categorias) && categorias.length > 0 ? (
                categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))
              ) : (
                <option disabled>Cargando categorías...</option>
              )}
            </select>
          </div>
          <div className={styles['form-group']}>
            <label htmlFor="tipo">Unidad de Medida</label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="peso">Kilogramo</option>
              <option value="unidad">Unidad</option>
            </select>
          </div>
          <div className={styles['form-group']}>
            <label htmlFor="imagen">Imagen</label>
            <input
              type="file"
              id="imagen"
              name="imagen"
              onChange={handleFileChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Registrar</button>
        </form>
      </div>
    </div>
  );
};

export default RegistrarProducto;
