const {
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.swc.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'backend-notebook-assistant',
  setupFilesAfterEnv: [...setupFilesAfterEnv, './jest.setup.js'],
};
