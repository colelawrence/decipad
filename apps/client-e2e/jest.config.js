const {
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.config');
const { baseUrl } = require('./testConfig');

module.exports = {
  ...baseConfig,
  displayName: 'client-e2e',
  preset: 'jest-playwright-preset',
  setupFilesAfterEnv: [...setupFilesAfterEnv, './src/utils/setup-tests.ts'],
  testEnvironmentOptions: {
    'jest-playwright': {
      contextOptions: {
        baseURL: baseUrl,
      },
      // defaults, here for ease of tweaking
      launchOptions: { headless: true },
      browsers: ['chromium'],
    },
  },
  testRegex: 'src/[^/]*\\.ts$',
};
