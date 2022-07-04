const { ...baseConfig } = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'computer',

  coverageThreshold: {
    global: {
      functions: 87,
      statements: 89,
      branches: 82,
    },
  },
};
