const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'services',
  testEnvironment: 'jsdom',
};
