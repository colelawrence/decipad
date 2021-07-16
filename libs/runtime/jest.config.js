module.exports = {
  displayName: 'runtime',
  testEnvironment: 'jsdom',
  preset: '../../jest.preset.js',
  setupFiles: ['./jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  maxWorkers: 1,
  bail: true,
  coverageThreshold: {
    global: {
      statements: 97,
      branches: 77,
      functions: 98,
      lines: 98,
    },
  },
};
