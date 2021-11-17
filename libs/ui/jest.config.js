const domConfig = require('../../jest-dom.config');

module.exports = {
  projects: [
    {
      ...domConfig,
      displayName: 'ui',
    },
    require.resolve('./jest-browser.config.js'),
  ],
};
