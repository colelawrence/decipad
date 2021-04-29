module.exports = {
  displayName: 'language',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  setupFiles: ['./jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', 'src/testUtils'],
  coverageThreshold: {
    global: {
      branches: 86,
      functions: 94,
      lines: 94,
      statements: 94,
    },
  },
};
