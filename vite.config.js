import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const srcRoot = resolve(__dirname, 'src');

/** With `base: '/Calculators/'`, opening the site root shows a blank page; send users to the app. */
function redirectRootToBase() {
  const middleware = (req, res, next) => {
    const pathOnly = req.url?.split('?')[0] ?? '';
    if (pathOnly === '/' || pathOnly === '') {
      res.statusCode = 302;
      res.setHeader('Location', '/Calculators/');
      res.end();
      return;
    }
    next();
  };
  return {
    name: 'redirect-root-to-base',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), redirectRootToBase()],
  base: '/Calculators/',
  resolve: {
    alias: {
      '@': srcRoot,
    },
  },
  server: {
    port: 8080,
    strictPort: true,
    open: '/Calculators/',
  },
  preview: {
    port: 4173,
    strictPort: true,
    open: '/Calculators/',
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
