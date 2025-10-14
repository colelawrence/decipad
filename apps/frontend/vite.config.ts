import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

dotenv.config();

const isForTests = !!process.env.CI || !!process.env.DECI_E2E;

const isForProduction = process.env.NODE_ENV === 'production';

// eslint-disable-next-line no-console
console.log(
  `Vite config: Running in ${isForTests ? 'test or production' : 'dev'} mode`
);

const serverOptions: UserConfig['server'] = {
  port: 3000,
  fs: {
    cachedChecks: false,
  },
  // open: !isForTests ? 'http://localhost:3000/w' : undefined,
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
  hmr: isForTests
    ? false
    : {
        overlay: false,
      },
};

const plugins = [
  wasm(),
  topLevelAwait(),
  react({
    jsxImportSource: '@emotion/react',
    plugins: [['@swc/plugin-emotion', {}]],
  }),
  tsconfigPaths(),
  VitePWA({
    filename: 'service-worker.js',
    registerType: null,
    injectRegister: null,
    workbox: {
      skipWaiting: true,
      clientsClaim: false,
      inlineWorkboxRuntime: true,
      cleanupOutdatedCaches: true,
      maximumFileSizeToCacheInBytes: 5_000_000, // 5MB
      globPatterns: ['**/*.{js,html,css,ico,png,svg,woff2}'],
      navigateFallback: null,
      navigateFallbackDenylist: [/^\/api/, /^\/graphql/, /^\/docs/],
      runtimeCaching: [
        {
          urlPattern: ({ request }) =>
            ['script', 'font', 'image', 'manifest', 'style', 'worker'].includes(
              request.destination
            ),
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'immutable-assets-cache',
            expiration: {
              maxAgeSeconds: 60 * 70 * 24 * 30, // 1 month
            },
            matchOptions: {
              ignoreVary: true,
            },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'document',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'index-cache',
            expiration: {
              maxAgeSeconds: 60, // 1 minute
            },
          },
        },
        {
          urlPattern: ({ url }) =>
            url.pathname.startsWith('/api') ||
            url.pathname.startsWith('/graphql') ||
            url.pathname.startsWith('/docs'),
          handler: 'NetworkOnly',
        },
      ],
    },
    devOptions: {
      enabled:
        process.env.NODE_ENV !== 'production' && !process.env.DISABLE_PWA,
    },
    manifest: {
      short_name: 'Decipad',
      name: 'Decipad — Make sense of numbers',
      theme_color: '#C1FA6B',
      background_color: '#F5F7FA',
      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
  }),
];

// todo: add the manifest!

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

const viteConfig: UserConfig = {
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
    plugins: () => [tsconfigPaths(), wasm(), topLevelAwait()],
    format: 'es',
  },
};

if (isForProduction) {
  viteConfig.optimizeDeps = {
    exclude: ['*'],
  };
}

// https://vitejs.dev/config/
export default defineConfig(viteConfig);
