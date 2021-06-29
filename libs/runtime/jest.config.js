module.exports = {
  displayName: 'runtime',
  testEnvironment: 'jsdom',
  preset: '../../jest.preset.js',
  setupFiles: ['./jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  maxWorkers: 1,
  coverageThreshold: {
    global: {
      branches: 68,
      functions: 83,
      lines: 86,
      statements: 86,
    },
  },
};
