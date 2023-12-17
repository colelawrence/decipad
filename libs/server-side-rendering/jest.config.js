const {
  setupFiles = [],
  ...baseConfig
} = require('../../jest-base.swc.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'server-side-rendering',
  setupFiles: [...setupFiles, './jest.setup.js'],
};
