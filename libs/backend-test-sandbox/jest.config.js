const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'backend-test-sandbox',
  testEnvironment: 'jsdom',
};
