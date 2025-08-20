// QuitarFondo.js
export function procesarImagen(file) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./QuitarFondo.worker.js", import.meta.url), { type: "module" });

    worker.postMessage(file);

    worker.onmessage = (e) => {
      const { success, file: processedFile, error } = e.data;
      worker.terminate();

      if (success) {
        resolve(processedFile);
      } else {
        reject(new Error(error));
      }
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };
  });
}
