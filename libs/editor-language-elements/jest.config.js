const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor',

  coverageThreshold: {
    global: {
      statements: 33,
      branches: 33,
    },
  },
};
