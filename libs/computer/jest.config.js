const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'computer',

  coverageThreshold: {
    global: {
      statements: 87,
      branches: 76,
      functions: 84,
      lines: 87,
    },
  },
};
