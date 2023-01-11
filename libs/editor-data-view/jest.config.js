const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-data-view',
  coverageThreshold: {
    global: {
      statements: 23,
      branches: 22,
      functions: 17,
      lines: 23,
    },
  },
};
