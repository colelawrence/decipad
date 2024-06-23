/// <reference types="vitest" />
// eslint-disable-next-line import/no-extraneous-dependencies
import { mergeConfig, defineConfig } from 'vitest/config';
// eslint-disable-next-line import/no-relative-packages
import rootViteConfig from '../../vite.config';

export default mergeConfig(
  rootViteConfig,
  defineConfig({
    test: {
      root: __dirname,
      include: ['src/**/*.spec.ts'],
      setupFiles: ['@vitest/web-worker', './vitest.setup.js'],
      globals: true,
    },
  })
);
