const { setupFilesAfterEnv, ...baseConfig } = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'computer',
  setupFilesAfterEnv: [...setupFilesAfterEnv, './jest.setup.js'],

  coverageThreshold: {
    global: {
      functions: 88,
      statements: 91,
      branches: 82,
    },
  },
};
