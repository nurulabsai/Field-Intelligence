import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // loadEnv is available for conditional env-based config if needed
  loadEnv(mode, '.', '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    plugins: [
      tailwindcss(),
      react(),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      // Raise the chunk size warning limit for this field-use app
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Split large vendor libraries into separate chunks for better caching
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            supabase: ['@supabase/supabase-js'],
            genai: ['@google/genai'],
            pdf: ['jspdf', 'jspdf-autotable'],
            zip: ['jszip'],
          },
        },
      },
    },
  };
});
