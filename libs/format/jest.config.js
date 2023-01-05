const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'format',
  coverageThreshold: {
    global: {
      statements: 96,
      branches: 88,
      functions: 100,
    },
  },
};
