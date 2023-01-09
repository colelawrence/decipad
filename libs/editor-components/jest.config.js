const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-components',
  coverageThreshold: {
    global: {
      statements: 30,
      branches: 21,
      functions: 24,
      lines: 31,
    },
  },
};
