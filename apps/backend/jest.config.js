module.exports = {
  displayName: 'backend',
  preset: '../../jest.preset.js',
  testURL: 'http://localhost:3333',
  setupFiles: ['./jest.setup.js'],
  maxWorkers: 1,
};
