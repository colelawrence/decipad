const { ...baseConfig } = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'docsync',

  coverageThreshold: {
    global: {
      functions: 88,
      statements: 89,
      branches: 83,
    },
  },
};
