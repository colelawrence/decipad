const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'format',
  coverageThreshold: {
    global: {
      statements: 98,
      branches: 87,
      functions: 100,
    },
  },
};
