const baseConfig = require('../../jest-base.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'interfaces',

  testEnvironment: 'jsdom',
};
