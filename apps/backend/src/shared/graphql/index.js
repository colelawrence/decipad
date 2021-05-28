'use strict';

const createServer = require('./server');

function createHandler({
  ApolloServer,
  gql,
  makeExecutableSchema,
  NextAuthJWT,
}) {
  const server = createServer({
    ApolloServer,
    gql,
    makeExecutableSchema,
    NextAuthJWT,
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

    context.event = event;
    context.additionalHeaders = new Map();

    event.httpMethod = event.httpMethod
      ? event.httpMethod
      : event.requestContext.http.method;

    event.path = event.requestContext.http.path;
    handler(event, context, callback);
  };
}

module.exports = createHandler;
