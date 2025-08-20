import React, { useState, useEffect, useContext, useRef } from 'react';
import { procesarImagen } from '../../components/QuitarFondo';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore, faSearch, faUpload } from "@fortawesome/free-solid-svg-icons";
import bdMercado, { BASE_IMG_URL } from '../../services/bdMercado';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../../styles/css/RegistrarProducto.module.css';
import Select from 'react-select';

const COLOR_VINO = '#6d071a';
const COLOR_CREMA = '#f5f0dc';
const COLOR_VINO_OSCURO = '#500013';
const COLOR_TEXTO = '#333333';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'white',
    borderColor: COLOR_VINO,
    boxShadow: state.isFocused ? `0 0 0 1px ${COLOR_VINO}` : 'none',
    '&:hover': { borderColor: COLOR_VINO },
    minHeight: '40px'
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    borderRadius: 5,
    overflow: 'hidden'
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? COLOR_VINO
      : state.isFocused
      ? COLOR_CREMA
      : 'white',
    color: state.isSelected ? COLOR_CREMA : COLOR_TEXTO,
    cursor: 'pointer',
    ':active': {
      backgroundColor: state.isSelected ? COLOR_VINO_OSCURO : COLOR_CREMA
    }
  }),
  placeholder: (provided) => ({
    ...provided,
    color: COLOR_TEXTO,
    fontSize: '1rem'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: COLOR_TEXTO,
    fontSize: '1rem'
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: COLOR_VINO,
    padding: '0 8px'
  }),
  indicatorSeparator: () => ({ display: 'none' })
};

const customTheme = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: COLOR_VINO,
    primary25: COLOR_CREMA,
    neutral0: 'white'
  }
});

const RegistrarProducto = ({ show, handleClose, refreshProducts }) => {
  const { user } = useContext(AuthContext);
  const [categorias, setCategorias] = useState([]);
  const [imagenesAPI, setImagenesAPI] = useState([]);
  const [loading, setLoading] = useState(false);
  const [procesandoImagen, setProcesandoImagen] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [selectedResultadoId, setSelectedResultadoId] = useState(null);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    stock: '',
    precio: '',
    categoria_id: '',
    tipo: 'peso',
    imagenOriginal: null,
    imagenExistente: null,
    estado: 1,
    proveedor_id: user?.related_data?.id || null,
  });

  useEffect(() => {
    const fetchCategorias = async () => {
      const provId = user?.related_data?.id;
      if (!provId) return;
      try {
        const { data } = await bdMercado.get(`/proveedores/categorias/${provId}`);
        setCategorias(data || []);
      } catch {
        toast.error('❌ No se pudieron cargar las categorías');
      }
    };

    const fetchImagenes = async () => {
      try {
        const { data } = await bdMercado.get('/imagenes');
        setImagenesAPI(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategorias();
    fetchImagenes();
  }, [user]);

  useEffect(() => {
    if (!busqueda.trim()) {
      setResultados([]);
      return;
    }
    const res = imagenesAPI
      .filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      .slice(0, 3);
    setResultados(res);
  }, [busqueda, imagenesAPI]);

  const handleChange = e => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'stock') v = value ? parseInt(value, 10) : '';
    if (name === 'precio') v = value ? parseFloat(value) : '';
    setFormData(f => ({ ...f, [name]: v }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData(f => ({ ...f, imagenOriginal: file, imagenExistente: null }));
    setSelectedResultadoId(null);
    toast.info('Imagen cargada desde tu equipo');
  };

  const handleCategoriaChange = opt => {
    setFormData(f => ({ ...f, categoria_id: opt?.value || '' }));
  };

  const seleccionarImagenExistente = (img) => {
    const imgUrl = img.url?.startsWith('http') ? img.url : `${BASE_IMG_URL}${img.url}`;
    setFormData(f => ({ ...f, imagenExistente: imgUrl, imagenOriginal: null }));
    setSelectedResultadoId(img.id_imagen);
    toast.info('Imagen seleccionada desde la base de datos');
  };

  const limpiarSeleccion = () => {
    setFormData(f => ({ ...f, imagenExistente: null, imagenOriginal: null }));
    setSelectedResultadoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.imagenOriginal && !formData.imagenExistente) {
      toast.error("❌ Debes seleccionar o subir una imagen");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== '' && !['imagenOriginal', 'imagenExistente'].includes(k)) {
          data.append(k, v);
        }
      });

      if (formData.imagenExistente) {
        data.append('imagen_url', formData.imagenExistente);
      } else {
        setProcesandoImagen(true);
        const imagenFinal = await procesarImagen(formData.imagenOriginal);
        setProcesandoImagen(false);
        data.append('imagen', imagenFinal);
      }

      await bdMercado.post('/productos', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('✅ Producto registrado con éxito');
      handleClose();
      refreshProducts();
    } catch (err) {
      console.error("Error al registrar:", err);
      toast.error('❌ No se pudo registrar el producto');
    } finally {
      setProcesandoImagen(false);
      setLoading(false);
    }
  };

  if (!show) return null;

  const opciones = categorias.map(c => ({ value: c.id, label: c.nombre }));
  const seleccionado = opciones.find(o => o.value === formData.categoria_id) || null;

  const onBackdrop = e => {
    if (e.target.classList.contains(styles.modal)) handleClose();
  };

  const hayImagen = !!(formData.imagenExistente || formData.imagenOriginal);

  return (
    <div className={styles.modal} onClick={onBackdrop}>
      {procesandoImagen && (
        <div className={styles.overlay}>
          <FontAwesomeIcon icon={faStore} spin size="3x" />
          <p>Procesando imagen...</p>
          <small>Esto puede tardar de 5 a 15 segundos...</small>
        </div>
      )}

      <div className={styles['modal-content']}>
        <span className={styles['close-button']} onClick={handleClose}>&times;</span>
        <h2>Registrar Producto</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" type="text" value={formData.nombre} onChange={handleChange} required />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="descripcion">Descripción</label>
            <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} required />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="precio">Precio</label>
            <input id="precio" name="precio" type="number" step="0.01" value={formData.precio} onChange={handleChange} required />
          </div>

          <div className={styles['form-group']}>
            <label>Categoría</label>
            <Select
              options={opciones}
              value={seleccionado}
              onChange={handleCategoriaChange}
              placeholder="Seleccione una categoría"
              styles={customStyles}
              theme={customTheme}
              isSearchable={false}
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="stock">Stock (opcional)</label>
            <input id="stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="tipo">Unidad de Medida</label>
            <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} required>
              <option value="peso">Kilogramo</option>
              <option value="unidad">Unidad</option>
            </select>
          </div>

          {/* ======= Barra unificada ======= */}
          <div className={styles['form-group']}>
            <label>Imagen</label>

            <div className={styles.comboBar}>
              <input
                className={styles.comboInput}
                type="text"
                placeholder="Buscar imagen existente o escribe y usa ‘Subir’"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              <FontAwesomeIcon icon={faSearch} className={styles.comboIconRight} />

              {!hayImagen ? (
                <button
                  type="button"
                  className={styles.comboBtn}
                  onClick={() => fileInputRef.current?.click()}
                  title="Subir imagen desde tu equipo"
                >
                  <FontAwesomeIcon icon={faUpload} />
                  <span className={styles.comboBtnText}>Subir</span>
                </button>
              ) : (
                <button
                  type="button"
                  className={`${styles.comboBtn} ${styles.changeBtn}`}
                  onClick={limpiarSeleccion}
                  title="Cambiar imagen"
                >
                  Cambiar
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenFile}
                onChange={handleFileChange}
              />
            </div>

            {resultados.length > 0 && (
              <div className={styles.resultados}>
                {resultados.map(img => {
                  const imgUrl = img.url?.startsWith('http') ? img.url : `${BASE_IMG_URL}${img.url}`;
                  const isSelected = img.id_imagen === selectedResultadoId;
                  return (
                    <div
                      key={img.id_imagen}
                      className={`${styles.resultadoItem} ${isSelected ? styles.selected : ''}`}
                      onClick={() => seleccionarImagenExistente(img)}
                    >
                      <img src={imgUrl} alt={img.nombre} />
                      <span>{img.nombre}</span>
                      {isSelected && <span className={styles.check}>✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* ======= Fin barra unificada ======= */}

          <button type="submit" className={styles.submitButton} disabled={loading || procesandoImagen}>
            {loading ? <FontAwesomeIcon icon={faStore} spin size="3x" /> : "Registrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrarProducto;
