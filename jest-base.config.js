module.exports = {
  collectCoverageFrom: ['<rootDir>/src/**'],
  coveragePathIgnorePatterns: ['^((?!<rootDir>).)*$'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  resolver: require.resolve('@nrwl/jest/plugins/resolver'),

  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(lib0|p-retry|y-protocols)/)',
    '\\.pnp\\.[^\\/]+$',
  ],
};
