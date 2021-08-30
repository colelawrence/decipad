const {
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'language',

  setupFilesAfterEnv: [...setupFilesAfterEnv, './jest.setup.js'],

  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', 'src/testUtils'],
  coverageThreshold: {
    global: {
      statements: 87,
      branches: 83,
      functions: 91,
      lines: 87,
    },
  },
};
