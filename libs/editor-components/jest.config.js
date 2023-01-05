const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-components',
  coverageThreshold: {
    global: {
      statements: 31,
      branches: 22,
      functions: 25,
      lines: 32,
    },
  },
};
