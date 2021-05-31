module.exports = {
  displayName: 'runtime',
  preset: '../../jest.preset.js',
  setupFiles: ['./jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  maxWorkers: 1,
  coverageThreshold: {
    global: {
      branches: 62,
      functions: 77,
      lines: 80,
      statements: 80,
    },
  },
};
