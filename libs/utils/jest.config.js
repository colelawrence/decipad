const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'utils',

  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
    },
  },
};
