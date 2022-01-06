const {
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.config');
const { baseUrl } = require('./testConfig');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'client-e2e',
  preset: 'jest-playwright-preset',
  setupFilesAfterEnv: [...setupFilesAfterEnv, './src/utils/setup-tests.ts'],
  testEnvironmentOptions: {
    'jest-playwright': {
      contextOptions: {
        baseURL: baseUrl,
        acceptDownloads: true,
      },
      // defaults, here for ease of tweaking
      launchOptions: { headless: true },
      browsers: ['chromium'],
    },
  },
  testRegex: 'src/[^/]*\\.ts$',
  testTimeout: 45000,
};
