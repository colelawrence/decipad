const os = require('os');
const {
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.config');
const { baseUrl } = require('./testConfig');

const debug = process.env.DEBUG === 'true';
const ci = !!process.env.CI;

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
        strictSelectors: true,
      },
      actionTimeout: 5_000,
      navigationTimeout: 20_000,

      launchOptions: { headless: !debug },
      browsers: ['chromium'],
    },
  },

  testRegex: 'src/[^/]*\\.ts$',

  testTimeout: debug ? 0 : 60_000,
  maxWorkers: ci ? 1 : Math.min(os.cpus.length, 4),
};
