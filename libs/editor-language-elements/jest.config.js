const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor',

  coverageThreshold: {
    global: {
      functions: 70,
      statements: 72,
      branches: 59,
    },
  },
};
