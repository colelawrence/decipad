module.exports = {
  displayName: 'runtime',
  preset: '../../jest.preset.js',
  setupFiles: ['./jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  maxWorkers: 1,
  coverageThreshold: {
    global: {
      branches: 68,
      functions: 78,
      lines: 82,
      statements: 82,
    },
  },
};
