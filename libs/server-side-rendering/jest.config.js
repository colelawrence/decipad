const { setupFiles = [], ...baseConfig } = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'server-side-rendering',
  setupFiles: [...setupFiles, './jest.setup.js'],
};
