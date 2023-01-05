const baseConfig = require('../../jest-dom.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'react-utils',

  coverageThreshold: {
    global: {
      statements: 88,
      branches: 72,
      functions: 90,
      lines: 88,
    },
  },
};
