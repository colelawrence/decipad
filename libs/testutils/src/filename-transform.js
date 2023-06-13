const stringify = require('json-stringify-safe');
const { basename } = require('path');

module.exports = {
  process(_src, filename) {
    return { code: `module.exports = ${stringify(basename(filename))};` };
  },
};
