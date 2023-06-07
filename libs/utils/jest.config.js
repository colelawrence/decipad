const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'utils',

  coverageThreshold: {
    global: {
      statements: 60,
      branches: 72,
      functions: 59,
    },
  },
};
