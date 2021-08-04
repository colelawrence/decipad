const { setupFiles = [], ...baseConfig } = require('../../jest-base.config.js');

const config = {
  ...baseConfig,
  displayName: 'backend',
  setupFiles: [...setupFiles, './jest.setup.js'],
  testTimeout: 10000,
  maxWorkers: 2,
  bail: true,
};

if (process.env.JEST_MAX_WORKERS) {
  config.maxWorkers =
    Number(process.env.JEST_MAX_WORKERS) || process.env.JEST_MAX_WORKERS;
}

module.exports = config;
