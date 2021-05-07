const { typedefs, resolvers } = require('../../graphql');
const context = require('./context');
const playground = require('./playground');

function createHandler({
  ApolloServer,
  gql,
  makeExecutableSchema,
  NextAuthJWT,
}) {
  if (typeof NextAuthJWT.encode !== 'function') {
    NextAuthJWT = NextAuthJWT.default;
  }

  const schema = makeExecutableSchema({
    typeDefs: typedefs({ gql }),
    resolvers,
  });

  const server = new ApolloServer({
    schema,
    context: context({ NextAuthJWT }),
    playground,
  });

  const handler = server.createHandler();

  return (event, context, _callback) => {
    const callback = (err, reply) => {
      if (!err && context.additionalHeaders.size > 0) {
        if (!reply.headers) {
          reply.headers = {};
        }
        for (const [key, value] of context.additionalHeaders) {
          reply.headers[key] = value;
        }
      }
      _callback(err, reply);
    };

    context.additionalHeaders = new Map();

    event.httpMethod = event.httpMethod
      ? event.httpMethod
      : event.requestContext.http.method;

    event.path = event.requestContext.http.path;
    handler(event, context, callback);
  };
}

module.exports = createHandler;
