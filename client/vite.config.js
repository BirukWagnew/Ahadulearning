import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // This will resolve '@' to the 'src' directory
    },
  },
  server: {
    headers: {
      // Allow media (thumbnails/avatars) from the API server during development.
      // NOTE: This is dev-only; adjust for production as needed.
      'Content-Security-Policy':
        "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; " +
        "img-src 'self' https: data: blob: http://localhost:5000 https://res.cloudinary.com https://*.cloudinary.com; " +
        "connect-src 'self' ws: http://localhost:5000; " +
        "font-src 'self' https: data:; " +
        "style-src 'self' https: 'unsafe-inline'; " +
        "script-src 'self' https: 'unsafe-inline' 'unsafe-eval'; object-src 'none'",
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false, // If you're working with a non-HTTPS backend in development
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

