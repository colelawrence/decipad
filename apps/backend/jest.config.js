const { setupFiles = [], ...baseConfig } = require('../../jest-base.config.js');

const config = {
  ...baseConfig,
  displayName: 'backend',

  testEnvironment: 'jsdom',
  setupFiles: [...setupFiles, './jest.setup.js'],

  testTimeout: 10000,
  // maxWorkers: 2,
  bail: true,

  coveragePathIgnorePatterns: ['node_modules', 'src'],
  // coverageThreshold: {
  //   global: {
  //     branches: 45,
  //     functions: 73,
  //     lines: 80,
  //     statements: 81,
  //   },
  // },
};

if (process.env.JEST_MAX_WORKERS) {
  config.maxWorkers =
    Number(process.env.JEST_MAX_WORKERS) || process.env.JEST_MAX_WORKERS;
}

module.exports = config;
