const {
  coveragePathIgnorePatterns = [],
  ...domConfig
} = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-tests',
  coveragePathIgnorePatterns: [
    ...coveragePathIgnorePatterns,
    'src/__fixtures__',
  ],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 66,
      functions: 100,
      lines: 100,
    },
  },
};
