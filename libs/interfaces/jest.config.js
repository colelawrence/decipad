const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'interfaces',
  testEnvironment: 'jsdom',
};
