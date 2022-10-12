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
      statements: 92,
      branches: 82,
      functions: 95,
      lines: 92,
    },
  },
};
