const path = require('path');
const {
  setupFiles = [],
  moduleNameMapper = {},
  ...baseConfig
} = require('../../jest-base.config');

const config = {
  ...baseConfig,
  displayName: 'backend',
  setupFiles: [...setupFiles, './jest.setup.js'],
  moduleNameMapper: {
    ...moduleNameMapper,
    '@decipad/backend-test-sandbox': path.join(
      __dirname,
      '..',
      '..',
      'libs',
      'backend-test-sandbox',
      'src'
    ),
  },
  testTimeout: 15000,
  maxWorkers: 2,
  bail: true,
};

if (process.env.JEST_MAX_WORKERS) {
  config.maxWorkers =
    Number(process.env.JEST_MAX_WORKERS) || process.env.JEST_MAX_WORKERS;
}

module.exports = config;
