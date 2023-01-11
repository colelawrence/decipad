const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'utils',

  coverageThreshold: {
    global: {
      statements: 89,
      branches: 86,
      functions: 88,
    },
  },
};
