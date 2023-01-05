const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-variable-def',
  coverageThreshold: {
    global: {
      statements: 36,
      branches: 30,
      functions: 29,
      lines: 37,
    },
  },
};
