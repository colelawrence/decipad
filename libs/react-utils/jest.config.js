const baseConfig = require('../../jest-dom.swc.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  displayName: 'react-utils',
  coverageThreshold: {
    global: {
      statements: 44,
      branches: 34,
      lines: 44,
      functions: 46,
    },
  },
  /* TODO: Update to latest Jest snapshotFormat
   * By default Nx has kept the older style of Jest Snapshot formats
   * to prevent breaking of any existing tests with snapshots.
   * It's recommend you update to the latest format.
   * You can do this by removing snapshotFormat property
   * and running tests with --update-snapshot flag.
   * Example: From within the project directory, run "nx test --update-snapshot"
   * More info: https://jestjs.io/docs/upgrading-to-jest29#snapshot-format
   */
  snapshotFormat: { escapeString: true, printBasicPrototype: true },
};
