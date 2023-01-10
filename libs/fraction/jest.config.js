const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'fraction',
  coverageThreshold: {
    global: {
      statements: 67,
      branches: 46,
      functions: 68,
      lines: 66,
    },
  },
};
