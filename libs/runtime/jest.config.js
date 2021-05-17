module.exports = {
  displayName: 'runtime',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  setupFiles: ['./jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 92,
      lines: 91,
      statements: 91,
    },
  },
};
