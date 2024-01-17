import { UserConfig, defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import dotenv from 'dotenv';

dotenv.config();

const serverOptions: UserConfig['server'] = {
  port: 3000,
  open: 'http://localhost:3000/api/auth/8VZFow-238xbFlfKJewgmPLdwIqEPhQvpb7voaWmeI',
  proxy: {
    '/api': {
      target: 'http://localhost:3333',
      changeOrigin: true,
    },
    '/graphql': {
      target: 'http://localhost:3333',
      changeOrigin: true,
    },
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      plugins: [['@swc/plugin-emotion', {}]],
    }),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      external: [
        '../../libs/live-connect/src/LiveConnect.worker.bundle.js',
        '../../libs/live-connect/src/notebook.bundle.js',
      ],
    },
    outDir: '../../dist/apps/frontend',
  },
  define: {
    'process.env': process.env,
    global: 'globalThis',
  },
  server: serverOptions,
  preview: serverOptions,
});
