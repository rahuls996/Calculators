import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const srcRoot = resolve(__dirname, 'src');

export default defineConfig({
  plugins: [react()],
  base: '/Calculators/',
  resolve: {
    alias: {
      '@': srcRoot,
    },
  },
  server: {
    port: 8080,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        healthInsurance: resolve(__dirname, 'health-insurance.html'),
      },
    },
  },
});
