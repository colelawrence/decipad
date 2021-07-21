const { setupFiles = [], ...baseConfig } = require('../../jest-base.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'replica',

  testEnvironment: 'jsdom',
  setupFiles: [...setupFiles, './jest.setup.js'],

  maxWorkers: 1,
  bail: true,

  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      statements: 77,
      branches: 60,
      lines: 77,
      functions: 79,
    },
  },
};
