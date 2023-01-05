const {
  coveragePathIgnorePatterns,
  ...baseConfig
} = require('../../jest-dom.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'client',
  coveragePathIgnorePatterns: [
    ...coveragePathIgnorePatterns,
    'src/graphql/*generated*',
  ],
};
