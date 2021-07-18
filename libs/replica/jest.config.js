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
      statements: 79,
      branches: 65,
      lines: 79,
      functions: 79,
    },
  },
};
