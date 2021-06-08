module.exports = {
  displayName: 'runtime',
  preset: '../../jest.preset.js',
  setupFiles: ['./jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  maxWorkers: 1,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 82,
      lines: 85,
      statements: 85,
    },
  },
};
