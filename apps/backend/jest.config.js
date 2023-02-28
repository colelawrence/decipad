const path = require('path');
const {
  setupFiles = [],
  moduleNameMapper = {},
  ...baseConfig
} = require('../../jest-base.config');

const config = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'backend',
  setupFiles: [...setupFiles, './jest.setup.js'],

  modulePathIgnorePatterns: ['<rootDir>/src/'],
  moduleNameMapper: {
    ...moduleNameMapper,
    '@decipad/backend-test-sandbox': path.join(
      __dirname,
      '../../libs/backend-test-sandbox/src'
    ),
  },

  testTimeout: 15000,
  maxWorkers: 1,
  bail: true,
};

module.exports = config;
