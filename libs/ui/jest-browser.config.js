const {
  setupFilesAfterEnv = [],
  transform,
  ...baseConfig
} = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'browser:ui',

  testMatch: ['**/*.browser-{test,spec}.{js,jsx,ts,tsx}'],

  transform: {
    ...transform,
    '^.+\\.(gif|jpg|png)$': require.resolve(
      '../testutils/src/filename-transform.js'
    ),
  },

  preset: 'jest-playwright-jsdom',
  setupFilesAfterEnv: [
    ...setupFilesAfterEnv,
    require.resolve('./src/test-utils/jest/setupTests.ts'),
    require.resolve('./src/test-utils/jest/setupPlaywright.ts'),
  ],
  testEnvironmentOptions: {
    'jest-playwright': {
      // defaults, here for ease of tweaking
      launchOptions: {
        headless: true,
      },
      browsers: ['chromium'],
    },
  },
};
