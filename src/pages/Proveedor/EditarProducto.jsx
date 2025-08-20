import React, { useState } from "react";
import styles from "../../styles/css/VenderProducto.module.css";

const initialState = (producto) => ({
  nombre: producto?.nombre || "",
  stock: producto?.stock || "",
  precio: producto?.precio || "",
  categoria_id: producto?.categoria_id || producto?.categoria?.id || "",
  descripcion: producto?.descripcion || "",
  tipo: producto?.tipo || "unidad",
  imagen: null,
});

const EditarProducto = ({ show, producto, categorias, onClose, onSave, isLoading }) => {
  const [values, setValues] = useState(initialState(producto));
  const [preview, setPreview] = useState(producto?.imagen ? producto.imagen : null);

  React.useEffect(() => {
    setValues(initialState(producto));
    setPreview(producto?.imagen ? producto.imagen : null);
  }, [producto]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && files.length) {
      setValues({ ...values, imagen: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setValues({ ...values, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(values);
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Editar Producto</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Nombre</label>
            <input name="nombre" value={values.nombre} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Stock</label>
            <input name="stock" type="number" value={values.stock} onChange={handleChange} required min={0} />
          </div>
          <div className={styles.formGroup}>
            <label>Precio</label>
            <input name="precio" type="number" step="0.01" value={values.precio} onChange={handleChange} required min={0} />
          </div>
          <div className={styles.formGroup}>
            <label>Categoría</label>
            <select name="categoria_id" value={values.categoria_id} onChange={handleChange} required>
              <option value="">Seleccionar</option>
              {categorias.map((c) => (
                <option value={c.id} key={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Descripción</label>
            <input name="descripcion" value={values.descripcion} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Tipo</label>
            <select name="tipo" value={values.tipo} onChange={handleChange}>
              <option value="peso">Peso (kg)</option>
              <option value="unidad">Unidad</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Imagen</label>
            <input type="file" accept="image/*" name="imagen" onChange={handleChange} />
            {preview && (
              <img src={preview} alt="preview" className={styles.image} />
            )}
          </div>
          <div className={styles.modalActions}>
            <button type="submit" className={styles.confirmBtn} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarProducto;
