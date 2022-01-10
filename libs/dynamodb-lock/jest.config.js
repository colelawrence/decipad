const { setupFiles = [], ...baseConfig } = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'dynamodb-lock',
  setupFiles: [...setupFiles, './jest.setup.js'],
};
