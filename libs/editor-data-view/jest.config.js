const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-data-view',
  coverageThreshold: {
    global: {
      statements: 61,
      branches: 42,
      functions: 56,
      lines: 61,
    },
  },
};
