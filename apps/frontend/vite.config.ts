import { UserConfig, defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import dotenv from 'dotenv';

dotenv.config();

const serverOptions: UserConfig['server'] = {
  port: 3000,
  fs: {
    cachedChecks: false,
  },
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

const plugins = [
  react({
    jsxImportSource: '@emotion/react',
    plugins: [['@swc/plugin-emotion', {}]],
  }),
  tsconfigPaths(),
];

if (process.env.SENTRY_AUTH_TOKEN) {
  plugins.push(
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: {
        name: process.env.GIT_COMMIT_HASH,
        dist: process.env.GIT_COMMIT_HASH,
      },
    })
  );
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins,
  build: {
    sourcemap: true,
    outDir: '../../dist/apps/frontend',
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  server: serverOptions,
  preview: serverOptions,
  worker: {
    plugins: () => [tsconfigPaths()],
  },
});
