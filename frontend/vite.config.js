import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- AÑADE ESTA SECCIÓN ---
  server: {
    // Esta sección es la clave.
    // Le dice a Vite que para cualquier ruta que no sea un archivo estático,
    // debe devolver el archivo /index.html.
    // Esto permite que react-router-dom maneje la navegación del lado del cliente.
    historyApiFallback: true,
  },
});

