module.exports = {
  displayName: 'lru-storage',
  testEnvironment: 'jsdom',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: ['./src/*.ts'],
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 80,
      functions: 100,
      lines: 95,
    },
  },
};
