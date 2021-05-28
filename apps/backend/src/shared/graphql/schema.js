'use strict';

const modules = require('./modules');
const resolvers = require('./resolvers');

const typedefs = ({ gql }) => modules.map(({ typedefs }) => typedefs(gql));

function createSchema({ gql, makeExecutableSchema }) {
  return makeExecutableSchema({
    typeDefs: typedefs({ gql }),
    resolvers,
  });
}

module.exports = createSchema;
