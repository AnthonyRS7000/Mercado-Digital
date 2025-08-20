// QuitarFondo.worker.js
import { removeBackground } from "@imgly/background-removal";
import imageCompression from "browser-image-compression";

self.onmessage = async (e) => {
  const file = e.data;

  try {
    // 1. Quitar fondo
    const blobSinFondo = await removeBackground(file);

    // 2. Convertir a PNG si no lo es
    const pngBlob = blobSinFondo.type === "image/png"
      ? blobSinFondo
      : new Blob([blobSinFondo], { type: "image/png" });

    let fileFinal = new File(
      [pngBlob],
      file.name.replace(/\.[^/.]+$/, ".png"),
      { type: "image/png" }
    );

    // 3. Comprimir si excede 2 MB
    if (fileFinal.size > 2 * 1024 * 1024) {
      fileFinal = await imageCompression(fileFinal, {
        maxSizeMB: 2,
        useWebWorker: true
      });
    }

    // 4. Enviar archivo procesado
    self.postMessage({ success: true, file: fileFinal });

  } catch (err) {
    let mensaje = "Error procesando la imagen";
    if (err?.message) mensaje = err.message;
    else if (typeof err === "string") mensaje = err;
    self.postMessage({ success: false, error: mensaje });
  }
};
