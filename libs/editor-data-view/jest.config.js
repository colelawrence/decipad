const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-data-view',
  coverageThreshold: {
    global: {
      statements: 24,
      branches: 22,
      functions: 18,
      lines: 24,
    },
  },
};
