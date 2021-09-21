const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'utils',
  testEnvironment: 'jsdom',
};
