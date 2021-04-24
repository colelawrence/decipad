const typeDefs = require('./typedefs')
const resolvers = require('./resolvers')
const context = require('./context')
const playground = require('./playground')

function createHandler({ ApolloServer, gql, NextAuthJWT }) {
  const server = new ApolloServer({
    typeDefs: typeDefs({ gql }),
    resolvers,
    context: context({ NextAuthJWT }),
    playground
  });
  const handler = server.createHandler();

  return (event, context, callback) => {
    event.httpMethod = event.httpMethod
      ? event.httpMethod
      : event.requestContext.http.method;

    event.path = event.requestContext.http.path;
    handler(event, context, callback);
  };
}

module.exports = createHandler;
