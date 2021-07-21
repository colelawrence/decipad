const { setupFiles = [], ...baseConfig } = require('../../jest-base.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'docsync',

  testEnvironment: 'jsdom',
  setupFiles: [...setupFiles, './jest.setup.js'],

  maxWorkers: 1,
  bail: true,

  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      statements: 97,
      branches: 77,
      functions: 98,
      lines: 98,
    },
  },
};
