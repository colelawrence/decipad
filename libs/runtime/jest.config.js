module.exports = {
  displayName: 'runtime',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  setupFiles: ['./jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
