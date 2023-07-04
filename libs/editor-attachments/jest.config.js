const domConfig = require('../../jest-dom.config');

module.exports = {
  ...domConfig,
  rootDir: __dirname,
  displayName: 'editor-attachments',
  paths: {
    axios: 'axios/dist/browser/axios.cjs',
  },
};
