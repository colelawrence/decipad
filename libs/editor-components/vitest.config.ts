/// <reference types="vitest" />
import { mergeConfig, defineConfig } from 'vitest/config';
// eslint-disable-next-line import/no-relative-packages
import rootViteConfig from '../../vite.web.config';

export default mergeConfig(
  rootViteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      root: __dirname,
      include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
      setupFiles: [
        '@vitest/web-worker',
        'vitest-canvas-mock',
        'vitest-fetch-mock',
        '../../libs/testutils/src/dom-extensions-setup-after-env',
        '../../libs/testutils/src/window-match-media-setup',
        './vitest.setup.js',
      ],
      server: {
        deps: {
          inline: [/react-tweet\/.*/],
        },
      },
    },
  })
);
