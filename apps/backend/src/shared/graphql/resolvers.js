'use strict';

const merge = require('lodash.merge');
const modules = require('./modules');

module.exports = merge(...modules.map(({ resolvers }) => resolvers || {}));
