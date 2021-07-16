module.exports = {
  displayName: 'replica',
  testEnvironment: 'jsdom',
  preset: '../../jest.preset.js',
  setupFiles: ['./jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  maxWorkers: 1,
  bail: true,
  coverageThreshold: {
    global: {
      statements: 81,
      branches: 66,
      lines: 80,
      functions: 79,
    },
  },
};
