const merge = require('lodash.merge');
const glbl = require('./global');
const teams = require('./teams');
const auth = require('./auth');

exports.typedefs = ({ gql }) =>
  [glbl.typedefs, teams.typedefs, auth.typedefs].map((typedef) => typedef(gql));

exports.resolvers = merge(glbl.resolvers, teams.resolvers, auth.resolvers);
