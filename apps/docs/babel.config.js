const { presets, ...config } = require('../../babel-web.config');

module.exports = {
  ...config,
  presets: [...presets, require.resolve('@docusaurus/core/lib/babel/preset')],
  sourceType: 'unambiguous',
};
