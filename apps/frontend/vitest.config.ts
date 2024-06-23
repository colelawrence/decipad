/// <reference types="vitest" />
import { mergeConfig, defineConfig } from 'vitest/config';
// eslint-disable-next-line import/no-relative-packages
import rootViteConfig from '../../vite.web.config';

export default mergeConfig(
  rootViteConfig,
  defineConfig({
    test: {
      root: __dirname,
      environment: 'jsdom',
      include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
      setupFiles: [
        '@vitest/web-worker',
        'fake-indexeddb/auto',
        '../../libs/testutils/src/dom-extensions-setup-after-env',
      ],
      globals: true,
      css: true,
      server: {
        deps: {
          inline: [/react-tweet\/.*/],
        },
      },
    },
  })
);
