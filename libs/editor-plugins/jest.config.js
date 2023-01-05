const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-plugins',

  coverageThreshold: {
    global: {
      statements: 58,
      branches: 47,
      functions: 48,
      lines: 59,
    },
  },
};
