const {
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'backend-search',
  setupFilesAfterEnv: [...setupFilesAfterEnv, './jest.setup.js'],
};
