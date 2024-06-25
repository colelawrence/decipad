import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

const plugins = [
  react({
    jsxImportSource: '@emotion/react',
    plugins: [['@swc/plugin-emotion', {}]],
  }),
  tsconfigPaths(),
  wasm(),
  topLevelAwait(),
];

const viteConfig: UserConfig = {
  plugins,
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
};

// https://vitejs.dev/config/
export default defineConfig(viteConfig);
