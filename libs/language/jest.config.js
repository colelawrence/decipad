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
    '!<rootDir>/src/data/*.ts',
    '!<rootDir>/src/builtins/operators/*.ts',
  ],
  coveragePathIgnorePatterns: [
    ...coveragePathIgnorePatterns,
    '/node_modules/',
    'src/testUtils',
    'src/data/*.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 92,
      branches: 82,
      functions: 94,
      lines: 92,
    },
  },
};
