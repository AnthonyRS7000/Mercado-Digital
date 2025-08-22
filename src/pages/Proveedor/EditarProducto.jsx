import React, { useState, useEffect, useRef, useContext } from "react";
import { procesarImagen } from "../../components/QuitarFondo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faSearch,
  faUpload,
  faArrowsRotate,
  faTimes, // 👈 icono cerrar
} from "@fortawesome/free-solid-svg-icons";
import bdMercado, { BASE_IMG_URL } from "../../services/bdMercado";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../../styles/css/EditarProducto.module.css";
import Select from "react-select";

const COLOR_VINO = "#6d071a";
const COLOR_CREMA = "#f5f0dc";
const COLOR_VINO_OSCURO = "#500013";
const COLOR_TEXTO = "#333333";

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "white",
    borderColor: COLOR_VINO,
    boxShadow: state.isFocused ? `0 0 0 1px ${COLOR_VINO}` : "none",
    "&:hover": { borderColor: COLOR_VINO },
    minHeight: "40px",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    borderRadius: 5,
    overflow: "hidden",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? COLOR_VINO
      : state.isFocused
      ? COLOR_CREMA
      : "white",
    color: state.isSelected ? COLOR_CREMA : COLOR_TEXTO,
    cursor: "pointer",
    ":active": {
      backgroundColor: state.isSelected ? COLOR_VINO_OSCURO : COLOR_CREMA,
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: COLOR_TEXTO,
    fontSize: "1rem",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: COLOR_TEXTO,
    fontSize: "1rem",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: COLOR_VINO,
    padding: "0 8px",
  }),
  indicatorSeparator: () => ({ display: "none" }),
};

const customTheme = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: COLOR_VINO,
    primary25: COLOR_CREMA,
    neutral0: "white",
  },
});

const EditarProducto = ({ show, producto, onClose, onSave, isLoading }) => {
  const { user } = useContext(AuthContext);

  const [categorias, setCategorias] = useState([]);
  const [imagenesAPI, setImagenesAPI] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [selectedResultadoId, setSelectedResultadoId] = useState(null);

  const [procesandoImagen, setProcesandoImagen] = useState(false);
  const [guardandoProducto, setGuardandoProducto] = useState(false);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null); // 👈 Referencia al modal

  const [formData, setFormData] = useState({
    nombre: "",
    stock: "",
    precio: "",
    categoria_id: "",
    descripcion: "",
    tipo: "peso",
    imagenOriginal: null,
    imagenExistente: null,
    imagenCambio: false,
    estado: 1,
    proveedor_id: user?.related_data?.id || null,
  });

  // 🔹 Función para cerrar el modal (solo si no está procesando)
  const handleClose = () => {
    if (!procesandoImagen && !guardandoProducto) {
      onClose();
    }
  };

  // 🔹 Manejar click fuera del modal
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  };

  // 🔹 Inicializar con datos del producto
  useEffect(() => {
    if (producto) {
      const nuevaImagenExistente = producto.imagen
        ? `${BASE_IMG_URL}/${producto.imagen.replace(/^\/+/, "")}`
        : null;

      setFormData({
        nombre: producto.nombre || "",
        stock: producto.stock || "",
        precio: producto.precio || "",
        categoria_id: producto.categoria_id || producto.categoria?.id || "",
        descripcion: producto.descripcion || "",
        tipo: producto.tipo || "peso",
        imagenOriginal: null,
        imagenExistente: nuevaImagenExistente,
        imagenCambio: false,
        estado: producto.estado ?? 1,
        proveedor_id: user?.related_data?.id || null,
      });
      setBusqueda("");
      setResultados([]);
      setSelectedResultadoId(null);
    }
  }, [producto, user]);

  // 🔹 Cargar categorías e imágenes
  useEffect(() => {
    const fetchCategorias = async () => {
      const provId = user?.related_data?.id;
      if (!provId) return;
      try {
        const { data } = await bdMercado.get(`/proveedores/categorias/${provId}`);
        setCategorias(data || []);
      } catch {
        toast.error("❌ No se pudieron cargar las categorías");
      }
    };

    const fetchImagenes = async () => {
      try {
        const { data } = await bdMercado.get("/imagenes");
        setImagenesAPI(data || []);
      } catch {
        toast.error("❌ Error al cargar imágenes");
      }
    };

    fetchCategorias();
    fetchImagenes();
  }, [user]);

  // 🔹 Filtrar resultados búsqueda
  useEffect(() => {
    if (!busqueda.trim()) {
      setResultados([]);
      return;
    }
    const res = imagenesAPI
      .filter((i) => i.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      .slice(0, 3);
    setResultados(res);
  }, [busqueda, imagenesAPI]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "stock") v = value ? parseInt(value, 10) : "";
    if (name === "precio") v = value ? parseFloat(value) : "";
    setFormData((f) => ({ ...f, [name]: v }));
  };

  const handleCategoriaChange = (opt) => {
    setFormData((f) => ({ ...f, categoria_id: opt?.value || "" }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProcesandoImagen(true);
      toast.info("Procesando imagen...");
      const imagenFinal = await procesarImagen(file);
      setFormData((f) => ({
        ...f,
        imagenOriginal: imagenFinal,
        imagenExistente: null,
        imagenCambio: true,
      }));
      setSelectedResultadoId(null);
      toast.success("✅ Imagen cargada y recortada correctamente");
    } catch {
      toast.error("❌ No se pudo procesar la imagen");
    } finally {
      setProcesandoImagen(false);
    }
  };

  const seleccionarImagenExistente = (img) => {
    const imgUrl = img.url?.startsWith("http")
      ? img.url
      : `${BASE_IMG_URL}${img.url}`;

    setFormData((f) => ({
      ...f,
      imagenExistente: imgUrl,
      imagenOriginal: null,
      imagenCambio: true,
    }));
    setSelectedResultadoId(img.id_imagen);
    toast.info("Imagen seleccionada desde la base de datos");
  };

  const limpiarSeleccion = () => {
    setFormData((f) => ({
      ...f,
      imagenExistente: null,
      imagenOriginal: null,
      imagenCambio: false,
    }));
    setSelectedResultadoId(null);
    setBusqueda("");
    setResultados([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tieneImagen =
      formData.imagenOriginal ||
      formData.imagenExistente ||
      (producto && producto.imagen);

    if (!tieneImagen) {
      toast.error("❌ Debes seleccionar o subir una imagen");
      return;
    }

    setGuardandoProducto(true);

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([k, v]) => {
        if (
          v !== null &&
          v !== "" &&
          !["imagenOriginal", "imagenExistente", "imagenCambio"].includes(k)
        ) {
          data.append(k, v);
        }
      });

      if (formData.imagenCambio) {
        if (formData.imagenExistente) {
          data.append("imagen_url", formData.imagenExistente);
        } else if (formData.imagenOriginal) {
          data.append("imagen", formData.imagenOriginal);
        }
      }

      await onSave(data);
      toast.success("✅ Producto actualizado con éxito");
      onClose();
    } catch {
      toast.error("❌ No se pudo actualizar el producto");
    } finally {
      setGuardandoProducto(false);
    }
  };

  if (!show) return null;

  const opciones = categorias.map((c) => ({ value: c.id, label: c.nombre }));
  const seleccionado =
    opciones.find((o) => o.value === formData.categoria_id) || null;

  const hayImagen = !!(formData.imagenExistente || formData.imagenOriginal);
  const imagenPreview = formData.imagenOriginal
    ? URL.createObjectURL(formData.imagenOriginal)
    : formData.imagenExistente ||
      (producto?.imagen
        ? `${BASE_IMG_URL}/${producto.imagen.replace(/^\/+/, "")}`
        : null);

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal} ref={modalRef}>
        {/* 🔹 Botón cerrar arriba */}
        <button 
          className={styles.closeBtn} 
          onClick={handleClose}
          disabled={procesandoImagen || guardandoProducto}
          title="Cerrar"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {procesandoImagen && (
          <div className={styles.overlay}>
            <FontAwesomeIcon icon={faStore} spin size="3x" />
            <p>Procesando imagen...</p>
            <small>Recortando fondo... Esto puede tardar de 5 a 15 segundos...</small>
          </div>
        )}

        {guardandoProducto && (
          <div className={styles.overlay}>
            <FontAwesomeIcon icon={faStore} spin size="3x" />
            <p>Guardando producto...</p>
          </div>
        )}

        <h2>Editar Producto</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Nombre */}
          <div className={styles.formGroup}>
            <label>Nombre</label>
            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          {/* Stock */}
          <div className={styles.formGroup}>
            <label>Stock</label>
            <input
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              min={0}
            />
          </div>

          {/* Precio */}
          <div className={styles.formGroup}>
            <label>Precio</label>
            <input
              name="precio"
              type="number"
              step="0.01"
              value={formData.precio}
              onChange={handleChange}
              min={0}
              required
            />
          </div>

          {/* Categoría */}
          <div className={styles.formGroup}>
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

          {/* Descripción */}
          <div className={styles.formGroup}>
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
            />
          </div>

          {/* Tipo */}
          <div className={styles.formGroup}>
            <label>Tipo</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange}>
              <option value="peso">Peso (kg)</option>
              <option value="unidad">Unidad</option>
            </select>
          </div>

          {/* Imagen */}
          <div className={styles.formGroup}>
            <label>Imagen</label>
            {!hayImagen ? (
              <div className={styles.comboBar}>
                <input
                  className={styles.comboInput}
                  type="text"
                  placeholder="Buscar imagen existente o escribe y usa 'Subir'"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  disabled={procesandoImagen}
                />
                <FontAwesomeIcon icon={faSearch} className={styles.comboIconRight} />
                <button
                  type="button"
                  className={styles.comboBtn}
                  onClick={() => fileInputRef.current?.click()}
                  title="Subir imagen desde tu equipo"
                  disabled={procesandoImagen}
                >
                  <FontAwesomeIcon icon={faUpload} />
                  <span className={styles.comboBtnText}>Subir</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenFile}
                  onChange={handleFileChange}
                  disabled={procesandoImagen}
                />
              </div>
            ) : (
              <button
                type="button"
                className={`${styles.comboBtn} ${styles.changeBtn}`}
                onClick={limpiarSeleccion}
                title="Cambiar imagen"
                disabled={procesandoImagen}
              >
                <FontAwesomeIcon icon={faArrowsRotate} />
                <span>Cambiar imagen</span>
              </button>
            )}

            {imagenPreview && (
              <div className={styles.imagePreview}>
                <img src={imagenPreview} alt="Vista previa" className={styles.image} />
                {formData.imagenCambio && (
                  <small className={styles.imageStatus}>
                    ✅ Imagen {formData.imagenOriginal ? "procesada" : "seleccionada"} - Lista para guardar
                  </small>
                )}
              </div>
            )}

            {resultados.length > 0 && (
              <div className={styles.resultados}>
                {resultados.map((img) => {
                  const imgUrl = img.url?.startsWith("http")
                    ? img.url
                    : `${BASE_IMG_URL}${img.url}`;
                  const isSelected = img.id_imagen === selectedResultadoId;
                  return (
                    <div
                      key={img.id_imagen}
                      className={`${styles.resultadoItem} ${isSelected ? styles.selected : ""}`}
                      onClick={() =>
                        !procesandoImagen && seleccionarImagenExistente(img)
                      }
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

          {/* Botones */}
          <div className={styles.modalActions}>
            <button
              type="submit"
              className={styles.confirmBtn}
              disabled={isLoading || procesandoImagen || guardandoProducto}
            >
              {guardandoProducto ? (
                <>
                  <FontAwesomeIcon icon={faStore} spin /> Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleClose}
              disabled={procesandoImagen || guardandoProducto}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarProducto;