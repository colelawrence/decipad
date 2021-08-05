const {
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.config');

module.exports = {
  projects: [
    {
      ...baseConfig,
      displayName: 'ui',

      testEnvironment: 'jsdom',
      setupFilesAfterEnv: [
        ...setupFilesAfterEnv,
        require.resolve('./src/test-utils/setupTests.ts'),
      ],
    },
    require.resolve('./jest-browser.config.js'),
  ],
};
