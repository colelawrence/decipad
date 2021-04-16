module.exports = {
  preset: "ts-jest",
  rootDir: '.',
  roots: ['<rootDir>'],
  testRegex: '.spec.[jt]s$',
  transform: {
    '^.+\\.[jt]s$': 'ts-jest',
  },
  testEnvironment: 'jsdom',
  projects: ['<rootDir>'],
  coverageDirectory: './coverage',
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
  testPathIgnorePatterns: [
    '<rootDir>[/\\\\](node_modules|.next|cypress|dist)[/\\\\]',
  ],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js,ts|tsx)$'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  globals: {
    'ts-jest': {
      diagnostics: false,
      isolatedModules: true,
    },
  },
};
