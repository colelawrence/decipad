const {
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.config');
const { baseUrl } = require('./testConfig');

const debug = process.env.DEBUG === 'true';

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
      launchOptions: { headless: !debug },
      browsers: ['chromium'],
    },
  },
  testRegex: 'src/[^/]*\\.ts$',
  testTimeout: debug ? 0 : 45000,
};
