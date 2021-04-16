const { ApolloServer  } = require('apollo-server-lambda');
const typeDefs = require('./typedefs')
const resolvers = require('./resolvers')
const context = require('./context')
const playground = require('./playground')

const server = new ApolloServer({ typeDefs, resolvers, context, playground });
const handler = server.createHandler();

function createHandler() {
  return (event, context, callback) => {
    event.httpMethod = event.httpMethod
      ? event.httpMethod
      : event.requestContext.http.method;

    event.path = event.requestContext.http.path;
    handler(event, context, callback);
  };
}

module.exports = createHandler;
