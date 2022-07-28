const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'fraction',
  coverageThreshold: {
    global: {
      statements: 63,
      branches: 31,
      functions: 50,
      lines: 63,
    },
  },
};
