const baseConfig = require('../../jest-dom.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'react-utils',

  coverageThreshold: {
    global: {
      statements: 51,
      branches: 40,
      lines: 51,
      functions: 50,
    },
  },
};
