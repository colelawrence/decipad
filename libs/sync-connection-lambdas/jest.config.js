const { setupFiles = [], ...baseConfig } = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'sync-connection-lambdas',
  setupFiles: [...setupFiles, './jest.setup.js'],
};
