const {
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'language',

  setupFilesAfterEnv: [...setupFilesAfterEnv, './jest.setup.js'],

  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', 'src/testUtils'],
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 89,
      functions: 96,
      lines: 95,
    },
  },
};
