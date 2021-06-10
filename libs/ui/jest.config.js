module.exports = {
  displayName: 'ui',
  preset: '../../jest.preset.js',
  moduleDirectories: ['node_modules', 'src/lib/utils', __dirname],
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  snapshotSerializers: [
    '@emotion/jest/serializer' /* if needed other snapshotSerializers should go here */,
  ],
  setupFilesAfterEnv: ['<rootDir>/src/lib/utils/setupTests.ts'],
  verbose: true,
};
