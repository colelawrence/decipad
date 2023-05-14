const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-data-view',
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 40,
      functions: 51,
      lines: 60,
    },
  },
};
