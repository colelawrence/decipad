const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-plugins',

  coverageThreshold: {
    global: {
      statements: 55,
      branches: 45,
      functions: 46,
      lines: 56,
    },
  },
};
