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
      statements: 65,
      branches: 50,
      lines: 65,
      functions: 67,
    },
  },
};
