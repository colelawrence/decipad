const domConfig = require('../../jest-base.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'notebook-tabs',

  snapshotFormat: { escapeString: true, printBasicPrototype: true },
};
