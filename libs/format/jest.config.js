const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'format',
  coverageThreshold: {
    global: {
      statements: 94,
      branches: 86,
      functions: 96,
    },
  },
};
