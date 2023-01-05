const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-data-view',
  coverageThreshold: {
    global: {
      statements: 25,
      branches: 22,
      functions: 19,
      lines: 25,
    },
  },
};
