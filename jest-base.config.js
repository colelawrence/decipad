// While we have Nx and can't know that a package.json script has already set TZ because there are so many ways of running Jest,
// we need to also ensure a defined TZ for the tests here just in case of e.g. `yarn nx test ui`.
process.env.TZ = process.env.TZ || 'America/Los_Angeles';

const { presets, plugins, moduleNameMapper } = require('./babel-web.config');

module.exports = {
  collectCoverageFrom: [
    '<rootDir>/src/**',
    '!<rootDir>/src/**/*.stories.tsx',
    '!<rootDir>/src/**/storybook-utils/**',
  ],
  coveragePathIgnorePatterns: ['^((?!<rootDir>).)*$'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs'],
  resolver: require.resolve('@nx/jest/plugins/resolver'),

  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets, plugins }],
    '^.+\\.mjs$': ['babel-jest', { presets, plugins }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(lib0|y-protocols|@udecode/plate-.*|nanoid|@decipad/safejs|@formkit/auto-animate|.*dnd.*|next-auth|is-stream|get-stream|langchain|csv-parse|jsonpath-plus|react-tweet|p-time|mimic-function|p-series|p-reduce|remark-parse|unified|bail|devlop|is-plain-obj|trough|vfile|vfile-message|unist-.*|unist-util-is|mdast-.*|micromark|micromark-.*|decode-named-character-reference|character-entities)/)',
    '\\.pnp\\.[^\\/]+$',
  ],

  moduleNameMapper: {
    ...moduleNameMapper,
  },

  setupFilesAfterEnv: [
    require.resolve('./libs/testutils/src/serialize-big-int.js'),
    require.resolve('./libs/testutils/src/structured-clone.js'),
    require.resolve('./libs/testutils/src/feature-flags-setup-after-env.js'),
    require.resolve('./libs/testutils/src/suppress-console-warnings.js'),
  ],
  testTimeout: 20000,
};
