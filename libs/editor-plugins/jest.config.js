const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-config',

  coverageThreshold: {
    global: {
      statements: 73,
      branches: 79,
    },
  },
};
