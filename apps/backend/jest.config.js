module.exports = {
  displayName: 'backend',
  testEnvironment: 'jsdom',
  preset: '../../jest.preset.js',
  testURL: 'http://localhost:3333',
  setupFiles: ['./jest.setup.js'],
  coveragePathIgnorePatterns: ['node_modules', 'src'],
  maxConcurrency: 1,
  maxWorkers: 1,
  testTimeout: 10000,
  bail: true,
  coverageThreshold: {
    global: {
      branches: 48,
      functions: 73,
      lines: 81,
      statements: 82,
    },
  },
};
