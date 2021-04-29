module.exports = {
  displayName: 'backend',
  preset: '../../jest.preset.js',
  testURL: 'http://localhost:3333',
  setupFiles: ['./jest.setup.js'],
  maxWorkers: 1,
  coveragePathIgnorePatterns: ['node_modules'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 100,
      lines: 96,
      statements: 94,
    },
  },
};
