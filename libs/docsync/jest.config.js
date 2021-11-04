const { setupFiles = [], ...baseConfig } = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'docsync',
  setupFiles: [...setupFiles, 'fake-indexeddb/auto', './jest.setup.js'],
};
