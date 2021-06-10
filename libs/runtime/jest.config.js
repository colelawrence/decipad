module.exports = {
  displayName: 'runtime',
  testEnvironment: 'jsdom',
  preset: '../../jest.preset.js',
  setupFiles: ['./jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  maxWorkers: 1,
  coverageThreshold: {
    global: {
      branches: 62,
      functions: 77,
      lines: 79,
      statements: 79,
    },
  },
};
