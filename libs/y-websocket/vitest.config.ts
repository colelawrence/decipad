/// <reference types="vitest" />
import { mergeConfig, defineConfig } from 'vitest/config';
import rootViteConfig from '../../vite.config';

export default mergeConfig(
  rootViteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      root: __dirname,
      include: ['src/**/*.spec.ts'],
      setupFiles: ['@vitest/web-worker'],
      css: true,
      globals: true,
    },
  })
);
