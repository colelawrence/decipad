const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-components',
  setupFilesAfterEnv: [...domConfig.setupFilesAfterEnv, './jest.setup.js'],
};
