const {
  setupFilesAfterEnv = [],
  transform,
  moduleNameMapper = {},
  ...baseConfig
} = require('./jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'ui',

  transform: {
    ...transform,
    '\\.(gif|jpg|png)$': require.resolve(
      './libs/testutils/src/filename-transform.js'
    ),
    '\\.css\\?raw$': require.resolve(
      './libs/testutils/src/source-transform.js'
    ),
  },
  moduleNameMapper: {
    ...moduleNameMapper,
    '^(.+)\\?raw$': '$1',
  },

  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    ...setupFilesAfterEnv,
    require.resolve('jest-canvas-mock'),
    require.resolve('./libs/testutils/src/dom-extensions-setup-after-env'),
    require.resolve('./libs/testutils/src/setup-chakra'),
  ],
};
