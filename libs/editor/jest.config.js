const baseConfig = require('../../jest-base.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'editor',

  testEnvironment: 'jsdom',
  snapshotSerializers: ['@emotion/jest/serializer'],
};
