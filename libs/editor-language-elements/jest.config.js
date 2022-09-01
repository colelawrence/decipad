const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor',

  coverageThreshold: {
    global: {
      functions: 61,
      statements: 63,
      branches: 42,
    },
  },
};
