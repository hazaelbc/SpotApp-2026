import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      leaflet: 'leaflet/dist/leaflet.js', // Asegura que Vite resuelva correctamente Leaflet
    },
  },
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import "leaflet/dist/leaflet.css";`,
      },
    },
  },
  server: {
    hmr: {
      overlay: false, // Opcional: desactiva el overlay de errores en el navegador
    },
  },
})