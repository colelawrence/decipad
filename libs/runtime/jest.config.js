module.exports = {
  displayName: 'runtime',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  setupFiles: ['./jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  maxWorkers: 1,
  coverageThreshold: {
    global: {
      branches: 67,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
