const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'computer',

  coverageThreshold: {
    global: {
      statements: 85,
      branches: 76,
      functions: 84,
      lines: 86,
    },
  },
};
