const {
  // intentionally taken out of the config because we have a preset
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  testEnvironment,
  setupFilesAfterEnv = [],
  ...domConfig
} = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  displayName: 'browser:ui',

  testMatch: ['**/*.visual-{test,spec}.{js,jsx,ts,tsx}'],

  preset: 'jest-playwright-jsdom',
  setupFilesAfterEnv: [
    ...setupFilesAfterEnv,
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
