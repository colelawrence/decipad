const {
  coveragePathIgnorePatterns,
  ...domConfig
} = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'ui',

  coveragePathIgnorePatterns: [
    ...coveragePathIgnorePatterns,
    '<rootDir>/src/lib',
  ],
};
