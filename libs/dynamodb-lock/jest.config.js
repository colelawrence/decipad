const path = require('path');
const { setupFiles = [], ...baseConfig } = require('../../jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: 'dynamodb-lock',
  setupFiles: [...setupFiles, './jest.setup.js'],
  moduleNameMapper: {
    '@decipad/backend-test-sandbox': path.join(
      __dirname,
      '..',
      '..',
      'libs',
      'backend-test-sandbox',
      'src'
    ),
  },
};
