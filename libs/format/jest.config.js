const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'format',
  coverageThreshold: {
    global: {
      statements: 92,
      branches: 79,
      functions: 100,
    },
  },
};
