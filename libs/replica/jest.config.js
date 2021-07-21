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
      statements: 78,
      branches: 60,
      lines: 78,
      functions: 79,
    },
  },
};
