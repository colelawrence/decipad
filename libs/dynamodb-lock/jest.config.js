const {
  setupFilesAfterEnv = [],
  ...baseConfig
} = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'dynamodb-lock',
  setupFilesAfterEnv: [...setupFilesAfterEnv, './jest.setup.js'],
  coverageThreshold: {
    global: {
      statements: 97,
      branches: 71,
      functions: 100,
      lines: 97,
    },
  },
};
