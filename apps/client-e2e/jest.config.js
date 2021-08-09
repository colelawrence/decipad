const {
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.config.js');
const { baseUrl } = require('./testConfig');

module.exports = {
  ...baseConfig,
  displayName: 'client-e2e',
  preset: 'jest-playwright-preset',
  setupFilesAfterEnv: [...setupFilesAfterEnv, './src/setupTests.ts'],
  testEnvironmentOptions: {
    'jest-playwright': {
      contextOptions: {
        baseURL: baseUrl,
      },
    },
  },
};
