import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es', // ⚡ Usa módulos ES en workers (evita el error de IIFE)
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined, // ⚡ evita conflictos de code splitting en workers
      },
    },
  },
})
