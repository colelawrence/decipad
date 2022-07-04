const {
  setupFilesAfterEnv = [],
  collectCoverageFrom,
  coveragePathIgnorePatterns,
  ...baseConfig
} = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'language',

  setupFilesAfterEnv: [...setupFilesAfterEnv, './jest.setup.js'],

  collectCoverageFrom: [
    ...collectCoverageFrom,
    '!<rootDir>/src/builtins/operators/*.ts',
  ],
  coveragePathIgnorePatterns: [
    ...coveragePathIgnorePatterns,
    '/node_modules/',
    'src/testUtils',
  ],
  coverageThreshold: {
    global: {
      statements: 93,
      branches: 83,
      functions: 96,
      lines: 93,
    },
  },
};
