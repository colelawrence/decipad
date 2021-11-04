const { setupFiles = [], ...baseConfig } = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'dynamodb-lock',
  setupFiles: [...setupFiles, './jest.setup.js'],
};
