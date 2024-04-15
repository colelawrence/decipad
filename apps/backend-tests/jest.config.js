const path = require('path');
const {
  setupFiles = [],
  moduleNameMapper = {},
  ...baseConfig
} = require('../../jest-base.config');

const config = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'backend-tests',
  setupFiles: [...setupFiles, './jest.setup.js'],

  moduleNameMapper: {
    ...moduleNameMapper,
    '@decipad/backend-test-sandbox': path.join(
      __dirname,
      '../../libs/backend-test-sandbox/src'
    ),
    '@decipad/tables': path.join(__dirname, '../../libs/tables/src'),
    '@decipad/backend-config': path.join(
      __dirname,
      '../../libs/backend-config/src'
    ),
    '@decipad/backend-notebook-content': path.join(
      __dirname,
      '../../libs/backend-notebook-content/src'
    ),
    '@decipad/utils': path.join(__dirname, '../../libs/utils/src'),
    '@decipad/slate-yjs': path.join(__dirname, '../../libs/slate-yjs/src'),
    '@decipad/editor-types': path.join(
      __dirname,
      '../../libs/editor-types/src'
    ),
    '@decipad/services/notebooks': path.join(
      __dirname,
      '../../libs/services/src/notebooks'
    ),
  },

  testTimeout: 15000,
  maxWorkers: 1,
  bail: true,
};

module.exports = config;
