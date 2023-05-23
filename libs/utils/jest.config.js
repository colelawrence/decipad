const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'utils',

  coverageThreshold: {
    global: {
      statements: 63,
      branches: 75,
      functions: 61,
    },
  },
};
