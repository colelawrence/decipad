const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor',
  coverageThreshold: {
    global: {
      statements: 24,
      branches: 15,
      functions: 22,
      lines: 24,
    },
  },
};
