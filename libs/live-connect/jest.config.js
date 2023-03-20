const {
  coveragePathIgnorePatterns,
  ...domConfig
} = require('../../jest-dom.config');

module.exports = {
  projects: [
    {
      ...domConfig,
      rootDir: __dirname,
      displayName: 'live-connect',

      coveragePathIgnorePatterns: [
        ...coveragePathIgnorePatterns,
        '<rootDir>/src/lib',
      ],
    },
  ],
};
