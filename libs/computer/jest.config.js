const { ...baseConfig } = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'computer',

  coverageThreshold: {
    global: {
      functions: 86,
      statements: 90,
      branches: 81,
    },
  },
};
