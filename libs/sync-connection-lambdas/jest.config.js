const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'sync-connection-lambdas',
  testTimeout: 15000,
  passWithNoTests: true,
};
