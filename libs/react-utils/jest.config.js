const baseConfig = require('../../jest-dom.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'react-utils',

  coverageThreshold: {
    global: {
      statements: 48,
      branches: 40,
      lines: 48,
      functions: 48,
    },
  },
};
