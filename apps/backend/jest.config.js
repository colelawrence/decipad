const config = {
  displayName: 'backend',
  testEnvironment: 'jsdom',
  preset: '../../jest.preset.js',
  setupFiles: ['./jest.setup.js'],
  coveragePathIgnorePatterns: ['node_modules', 'src'],
  testTimeout: 10000,
  maxWorkers: 2,
  bail: true,
  // coverageThreshold: {
  //   global: {
  //     branches: 45,
  //     functions: 73,
  //     lines: 80,
  //     statements: 81,
  //   },
  // },
};

if (process.env.JEST_MAX_WORKERS) {
  config.maxWorkers =
    Number(process.env.JEST_MAX_WORKERS) || process.env.JEST_MAX_WORKERS;
}

module.exports = config;
