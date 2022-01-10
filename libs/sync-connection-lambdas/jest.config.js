const { setupFiles = [], ...baseConfig } = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'sync-connection-lambdas',
  setupFiles: [...setupFiles, './jest.setup.js'],
};
