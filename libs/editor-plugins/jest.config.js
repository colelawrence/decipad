const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-plugins',

  coverageThreshold: {
    global: {
      statements: 63,
      branches: 52,
    },
  },
};
