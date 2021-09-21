const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'backend-test-sandbox',
  testEnvironment: 'jsdom',
};
