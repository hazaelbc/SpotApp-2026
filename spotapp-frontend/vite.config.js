import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'configure-coop',
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
          next();
        });
      },
    },
  ],
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
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
})