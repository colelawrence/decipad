// While we have Nx and can't know that a package.json script has already set TZ because there are so many ways of running Jest,
// we need to also ensure a defined TZ for the tests here just in case of e.g. `yarn nx test ui`.
process.env.TZ = process.env.TZ || 'America/Los_Angeles';

module.exports = {
  collectCoverageFrom: ['<rootDir>/src/**'],
  coveragePathIgnorePatterns: ['^((?!<rootDir>).)*$'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs'],
  resolver: require.resolve('@nrwl/jest/plugins/resolver'),

  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(lib0|p-retry|y-protocols|@formkit/auto-animate|.*dnd.*)/)',
    '\\.pnp\\.[^\\/]+$',
  ],

  setupFilesAfterEnv: [
    require.resolve('./libs/testutils/src/feature-flags-setup-after-env.js'),
  ],
};
