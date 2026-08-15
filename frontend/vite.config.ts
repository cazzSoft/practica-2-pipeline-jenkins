import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'gestion-usuarios-frontend-production-a2e7.up.railway.app',
      '.railway.app',
      '.up.railway.app',
      'localhost',
      '127.0.0.1',
    ],
  },

  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'gestion-usuarios-frontend-production-a2e7.up.railway.app',
      '.railway.app',
      '.up.railway.app',
      'localhost',
      '127.0.0.1',
    ],
  },
});