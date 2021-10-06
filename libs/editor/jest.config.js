const {
  transform,
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.config');

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
  setupFilesAfterEnv: [
    ...setupFilesAfterEnv,
    require.resolve('../testutils/src/dom-extensions-setup-after-env'),
  ],
};
