const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-variable-def',
  coverageThreshold: {
    global: {
      statements: 36,
      branches: 29,
      functions: 28,
      lines: 37,
    },
  },
};
