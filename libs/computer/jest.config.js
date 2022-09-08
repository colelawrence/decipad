const { ...baseConfig } = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'computer',

  coverageThreshold: {
    global: {
      functions: 83,
      statements: 88,
      branches: 82,
    },
  },
};
