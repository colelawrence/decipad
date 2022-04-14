const config = require('./babel.config');
const babelrc = require('./babel-web.babelrc');

module.exports = {
  presets: [...config.presets, ...babelrc.presets],
  plugins: [...config.plugins, ...babelrc.plugins],
};
