const baseConfig = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'editor',

  testEnvironment: 'jsdom',
  snapshotSerializers: ['@emotion/jest/serializer'],
};
