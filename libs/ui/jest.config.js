const {
  coveragePathIgnorePatterns,
  ...domConfig
} = require('../../jest-dom.config');

// Hack: it does not seem possible to change timezones in Jest
// https://github.com/facebook/jest/issues/9856
process.env.TZ = 'America/Los_Angeles';

module.exports = {
  projects: [
    {
      ...domConfig,
      rootDir: __dirname,
      displayName: 'ui',

      coveragePathIgnorePatterns: [
        ...coveragePathIgnorePatterns,
        '<rootDir>/src/lib',
      ],
    },
    require.resolve('./jest-browser.config.js'),
  ],

  coverageThreshold: {
    global: {
      statements: 85,
      branches: 85,
    },
  },
};
