const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-plugins',

  coverageThreshold: {
    global: {
      statements: 54.8,
      branches: 43,
      functions: 46,
      lines: 55.7,
    },
  },
};
