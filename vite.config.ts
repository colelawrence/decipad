import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import wasm from 'vite-plugin-wasm';

const plugins = [
  react({
    jsxImportSource: '@emotion/react',
    plugins: [['@swc/plugin-emotion', {}]],
  }),
  tsconfigPaths(),
  wasm(),
];

const viteConfig: UserConfig = {
  plugins: [plugins],
  build: {
    sourcemap: true,
    outDir: './dist/apps/frontend',
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  worker: {
    plugins: () => [tsconfigPaths()],
  },
  assetsInclude: ['**/*.sql'],
};

// https://vitejs.dev/config/
export default defineConfig(viteConfig);
