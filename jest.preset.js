const {
  // let Jest handle transform automatically
  transform,
  ...nxPreset
} = require('@nrwl/jest/preset');

module.exports = {
  ...nxPreset,
  coverageDirectory: '<rootDir>/coverage',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
