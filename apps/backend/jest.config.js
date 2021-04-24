module.exports = {
  displayName: 'backend',
  preset: '../../jest.preset.js',
  testURL: 'http://localhost:3333',
  setupFiles: ['./jest.setup.js'],
  maxWorkers: 1
  // transform: {
  //   '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
  //   '^.+\\.[tj]sx?$': 'babel-jest',
  // },
  // rootDir: __dirname,
  // moduleFileExtensions: ['ts', 'js'],
  // coverageDirectory: '../../coverage/apps/backend',
};
