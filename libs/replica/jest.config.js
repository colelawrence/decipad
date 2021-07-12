module.exports = {
  displayName: 'replica',
  testEnvironment: 'jsdom',
  preset: '../../jest.preset.js',
  setupFiles: ['./jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  maxWorkers: 1,
  coverageThreshold: {
    global: {
      statements: 72,
      branches: 57,
      lines: 72,
      functions: 72,
    },
  },
};
