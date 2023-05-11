const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-components',
  coverageThreshold: {
    global: {
      statements: 31.3,
      branches: 21,
      functions: 23.1,
      lines: 31.1,
    },
  },
};
