const {
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'language',

  setupFilesAfterEnv: [...setupFilesAfterEnv, './jest.setup.js'],

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/data/*.ts',
    '!src/builtins/operators/*.ts',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/testUtils',
    'src/data/*.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 92,
      branches: 84,
      functions: 95,
      lines: 92,
    },
  },
};
