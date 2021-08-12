const {
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'browser:ui',

  testMatch: ['**/*.browser-{test,spec}.{js,jsx,ts,tsx}'],

  preset: 'jest-playwright-jsdom',
  setupFilesAfterEnv: [
    ...setupFilesAfterEnv,
    require.resolve('./src/test-utils/jest/setupTests.ts'),
  ],
  // defaults, here for ease of tweaking
  testEnvironmentOptions: {
    'jest-playwright': {
      launchOptions: { headless: true },
      browsers: ['chromium'],
    },
  },
};
