const { join } = require('node:path');
const {
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.swc.config');

module.exports = {
  ...baseConfig,
  rootDir: join(__dirname),
  displayName: 'backend-code-assistant',
  setupFilesAfterEnv: [...setupFilesAfterEnv, join(__dirname, 'jest.setup.js')],
};
