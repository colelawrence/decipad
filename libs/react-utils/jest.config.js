const baseConfig = require('../../jest-dom.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'react-utils',

  coverageThreshold: {
    global: {
      statements: 86,
      branches: 66,
      functions: 90,
      lines: 86,
    },
  },
};
