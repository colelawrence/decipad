const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-utils',
  coverageThreshold: {
    global: {
      statements: 27,
      branches: 23,
      functions: 29,
      lines: 28,
    },
  },
};
