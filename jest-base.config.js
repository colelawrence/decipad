module.exports = {
  coverageDirectory: '<rootDir>/coverage',

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  resolver: require.resolve('@nrwl/jest/plugins/resolver'),

  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@apache-arrow/es5-cjs|lib0|y-protocols)/)',
    '\\.pnp\\.[^\\/]+$',
  ],
};
