/// <reference types="vitest" />
import { mergeConfig, defineConfig } from 'vitest/config';
import rootViteConfig from '../../vite.config';

export default mergeConfig(
  rootViteConfig,
  defineConfig({
    test: {
      root: __dirname,
      include: ['src/**/*.spec.ts'],
      setupFiles: ['@vitest/web-worker'],
      globals: true,
    },
  })
);
