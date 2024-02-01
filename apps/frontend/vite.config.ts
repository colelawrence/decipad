import { UserConfig, defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { sentryVitePlugin } from '@sentry/vite-plugin';
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
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: {
        name: process.env.GIT_COMMIT_HASH,
        dist: process.env.GIT_COMMIT_HASH,
      },
    }),
  ],
  build: {
    rollupOptions: {
      external: [
        '../../libs/live-connect/src/LiveConnect.worker.bundle.js',
        '../../libs/live-connect/src/notebook.bundle.js',
      ],
    },
    sourcemap: true,
    outDir: '../../dist/apps/frontend',
  },
  define: {
    'process.env': process.env,
    global: 'globalThis',
  },
  server: serverOptions,
  preview: serverOptions,
});
