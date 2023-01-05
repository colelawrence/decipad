const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor',

  coverageThreshold: {
    global: {
      statements: 65,
      branches: 61,
      functions: 73,
    },
  },
};
