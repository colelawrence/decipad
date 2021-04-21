module.exports = {
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>'],
  projects: ['<rootDir>'],
  coverageDirectory: './coverage',
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
  testPathIgnorePatterns: [
    '<rootDir>[/\\\\](node_modules|.next|cypress|dist)[/\\\\]',
  ],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js,ts|tsx)$'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', 'src/testUtils'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
