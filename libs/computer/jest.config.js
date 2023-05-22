const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'computer',

  coverageThreshold: {
    global: {
      statements: 83,
      branches: 74,
      functions: 82,
      lines: 84,
    },
  },
};
