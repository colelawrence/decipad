// While we have Nx and can't know that a package.json script has already set TZ because there are so many ways of running Jest,
// we need to also ensure a defined TZ for the tests here just in case of e.g. `yarn nx test ui`.
process.env.TZ = process.env.TZ || 'America/Los_Angeles';

const { presets, plugins } = require('./babel-web.config');

module.exports = {
  collectCoverageFrom: [
    '<rootDir>/src/**',
    '!<rootDir>/src/**/*.stories.tsx',
    '!<rootDir>/src/**/storybook-utils/**',
  ],
  coveragePathIgnorePatterns: ['^((?!<rootDir>).)*$'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs'],
  resolver: require.resolve('@nrwl/jest/plugins/resolver'),

  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets, plugins }],
    '^.+\\.mjs$': ['babel-jest', { presets, plugins }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(lib0|p-retry|y-protocols|@formkit/auto-animate|.*dnd.*)/)',
    '\\.pnp\\.[^\\/]+$',
  ],

  setupFilesAfterEnv: [
    require.resolve('./libs/testutils/src/serialize-big-int.js'),
    require.resolve('./libs/testutils/src/deci-number-snapshot-serializer.js'),
    require.resolve('./libs/testutils/src/feature-flags-setup-after-env.js'),
    require.resolve('./libs/testutils/src/suppress-console-warnings.js'),
  ],
  testTimeout: 20000,
};
