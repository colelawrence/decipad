module.exports = {
  displayName: 'language',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  setupFiles: ['./jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', 'src/testUtils'],
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 89,
      functions: 96,
      lines: 95,
    },
  },
};
