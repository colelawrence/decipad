const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor',

  coverageThreshold: {
    global: {
      functions: 75,
      statements: 70,
      branches: 65,
    },
  },
};
