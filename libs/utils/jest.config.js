const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'utils',

  coverageThreshold: {
    global: {
      statements: 86,
      branches: 86,
      functions: 82,
    },
  },
};
