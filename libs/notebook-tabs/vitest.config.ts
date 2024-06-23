/// <reference types="vitest" />
import { mergeConfig, defineConfig } from 'vitest/config';
// eslint-disable-next-line import/no-relative-packages
import rootViteConfig from '../../vite.config';

export default mergeConfig(
  rootViteConfig,
  defineConfig({
    test: {
      root: __dirname,
      include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    },
  })
);
