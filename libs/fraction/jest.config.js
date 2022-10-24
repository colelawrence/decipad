const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'fraction',
  coverageThreshold: {
    global: {
      statements: 74,
      branches: 59,
      functions: 75,
      lines: 72,
    },
  },
};
