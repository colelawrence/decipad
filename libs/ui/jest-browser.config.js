const {
  coveragePathIgnorePatterns,
  setupFilesAfterEnv = [],
  // environment intentionally taken out of the config because we have a preset
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  testEnvironment,
  ...domConfig
} = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'browser:ui',

  testMatch: ['**/*.visual-{test,spec}.{js,jsx,ts,tsx}'],
  coveragePathIgnorePatterns: [
    ...coveragePathIgnorePatterns,
    '<rootDir>/src/lib',
  ],

  preset: 'jest-playwright-jsdom',
  setupFilesAfterEnv: [
    ...setupFilesAfterEnv,
    require.resolve('./src/test-utils/jest/setupPlaywright.ts'),
  ],
  testEnvironmentOptions: {
    'jest-playwright': {
      // defaults, here for ease of tweaking
      launchOptions: {
        headless: true,
      },
      browsers: ['chromium'],
    },
  },
};
