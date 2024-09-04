/// <reference types="vitest" />
import { mergeConfig, defineConfig } from 'vitest/config';
// eslint-disable-next-line import/no-relative-packages
import rootViteConfig from './vite.config';

export default mergeConfig(
  rootViteConfig,
  defineConfig({
    test: {
      testTimeout: 20_000,
      setupFiles: [
        '@vitest/web-worker',
        '../../vitest.base.setup.mjs',
        'fake-indexeddb/auto',
      ],
      server: {
        deps: {
          inline: [/react-tweet\/.*/],
        },
      },
    },
  })
);
