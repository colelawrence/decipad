/// <reference types="vitest" />
import { mergeConfig, defineConfig } from 'vitest/config';
import rootViteConfig from './vite.config';

export default mergeConfig(
  rootViteConfig,
  defineConfig({
    test: {
      testTimeout: 20_000,
      environment: 'jsdom',
      globalSetup: '../../vitest.global.setup.mjs',
      setupFiles: [
        '@vitest/web-worker',
        'vitest-canvas-mock',
        'vitest-fetch-mock',
        '../../libs/testutils/src/dom-extensions-setup-after-env',
        '../../libs/testutils/src/window-match-media-setup',
        '../../vitest.web.setup.mjs'
      ],
      css: true,
      server: {
        deps: {
          inline: [/react-tweet\/.*/],
        },
      },
    },
  })
);
