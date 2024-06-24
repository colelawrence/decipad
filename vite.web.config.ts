/// <reference types="vitest" />
import { mergeConfig } from 'vitest/config';
// eslint-disable-next-line import/no-relative-packages
import rootViteConfig from './vite.config';
import react from '@vitejs/plugin-react-swc';

export default mergeConfig(rootViteConfig, {
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      plugins: [['@swc/plugin-emotion', {}]],
    }),
  ],
});
