module.exports = [
  require('./base'),
  require('./date'),
  require('./global'),
  require('./pagination'),
  require('./registration'),
  require('./users'),
  require('./auth'),
  require('./roles'),
  require('./workspaces'),
  require('./pads'),
  require('./share'),
];

if (process.env !== 'production') {
  module.exports.push(require('./hello'));
}
