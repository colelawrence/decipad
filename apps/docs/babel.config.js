const { presets, ...config } = require('../../babel-web.config');

module.exports = {
  ...config,
  presets: [require.resolve('@docusaurus/core/lib/babel/preset'), ...presets],
  sourceType: 'unambiguous',
};
