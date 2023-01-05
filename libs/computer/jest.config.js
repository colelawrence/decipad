const { setupFilesAfterEnv, ...baseConfig } = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'computer',
  setupFilesAfterEnv: [...setupFilesAfterEnv, './jest.setup.js'],

  coverageThreshold: {
    global: {
      statements: 87,
      branches: 77,
      functions: 84,
      lines: 88,
    },
  },
};
