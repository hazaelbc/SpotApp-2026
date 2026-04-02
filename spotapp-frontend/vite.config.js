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
    alias: [
      {
        // Only replace the bare "leaflet" import so we don't interfere with other paths
        find: /^leaflet$/,
        replacement: 'leaflet/dist/leaflet.js',
      },
    ],
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
        target: 'https://spotapp-2026.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
})