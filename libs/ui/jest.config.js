const {
  setupFilesAfterEnv = [],
  transform,
  ...baseConfig
} = require('../../jest-base.config');

module.exports = {
  projects: [
    {
      ...baseConfig,
      displayName: 'ui',

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
        require.resolve('./src/test-utils/jest/setupTests.ts'),
      ],
    },
    require.resolve('./jest-browser.config.js'),
  ],
};
