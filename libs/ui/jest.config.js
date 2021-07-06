module.exports = {
  displayName: 'ui',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [require.resolve('./src/utils/setupTests.ts')],
};
