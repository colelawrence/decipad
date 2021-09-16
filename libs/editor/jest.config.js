const { transform, ...baseConfig } = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'editor',

  transform: {
    ...transform,
    '^.+\\.(gif|jpg|png)$': require.resolve(
      '../testutils/src/filename-transform.js'
    ),
  },

  testEnvironment: 'jsdom',
  snapshotSerializers: ['@emotion/jest/serializer'],
};
