const {
  coveragePathIgnorePatterns,
  ...domConfig
} = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-table',
  coveragePathIgnorePatterns: [
    ...coveragePathIgnorePatterns,
    'src/__fixtures__',
  ],
  coverageThreshold: {
    global: {
      statements: 26,
      branches: 20,
      functions: 17,
      lines: 27,
    },
  },
};
