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

  coverageThreshold: {
    global: {
      statements: 75.5,
      branches: 55,
      functions: 60,
      lines: 76.5,
    },
  },
};
