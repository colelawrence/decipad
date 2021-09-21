const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'interfaces',
  testEnvironment: 'jsdom',
};
