import React, { useState, useEffect, useContext } from 'react';
import bdMercado from '../../services/bdMercado';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/css/RegistrarProducto.css';

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
      try {
        if (user?.related_data?.id) {
          const response = await bdMercado.get(`/v1/proveedor/${user.related_data.id}`);
          setCategorias(response.data.categorias);
        } else {
          const response = await bdMercado.get('/v1/categorias');
          setCategorias(response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (user) {
      fetchCategorias();
    }
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
      console.error('Error registering product:', error);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={handleClose}>&times;</span>
        <h2>Registrar Producto</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} required />
            <small>Ingrese la cantidad de kilogramos o unidades</small>
          </div>
          <div className="form-group">
            <label htmlFor="precio">Precio</label>
            <input type="number" id="precio" step="0.01" name="precio" value={formData.precio} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="categoria_id">Categoría</label>
            <select id="categoria_id" name="categoria_id" value={formData.categoria_id} onChange={handleChange} required>
              <option value="">Seleccione una categoría</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="tipo">Unidad de Medida</label>
            <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} required>
              <option value="peso">Kilogramo</option>
              <option value="unidad">Unidad</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="imagen">Imagen</label>
            <input type="file" id="imagen" name="imagen" onChange={handleFileChange} required />
          </div>
          <button type="submit" className="btn btn-primary">Registrar</button>
        </form>
      </div>
    </div>
  );
};

export default RegistrarProducto;
