const {
  coveragePathIgnorePatterns,
  ...domConfig
} = require('../../jest-dom.config');

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
      statements: 86,
      branches: 73,
    },
  },
};
