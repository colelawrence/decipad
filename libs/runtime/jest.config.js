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
      lines: 92,
      statements: 91,
    },
  },
  setupFiles: ['./jest.setup.js']
};
