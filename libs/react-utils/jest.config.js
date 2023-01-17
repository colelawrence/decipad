const baseConfig = require('../../jest-dom.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'react-utils',

  coverageThreshold: {
    global: {
      statements: 61,
      branches: 54,
      lines: 61,
      functions: 60,
    },
  },
};
