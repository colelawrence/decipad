const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'lru-storage',

  testEnvironment: 'jsdom',

  collectCoverageFrom: ['./src/*.ts'],
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 80,
      functions: 100,
      lines: 95,
    },
  },
};
