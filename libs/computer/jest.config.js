const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'computer',

  coverageThreshold: {
    global: {
      statements: 84,
      branches: 75,
      functions: 83,
      lines: 85,
    },
  },
};
