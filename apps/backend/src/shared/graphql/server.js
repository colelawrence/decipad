'use strict';

const createSchema = require('./schema');
const createContext = require('./context');
const playground = require('./playground');

function createServer({
  ApolloServer,
  gql,
  makeExecutableSchema,
  NextAuthJWT,
}) {
  if (typeof NextAuthJWT.encode !== 'function') {
    NextAuthJWT = NextAuthJWT.default;
  }

  const schema = createSchema({ gql, makeExecutableSchema });
  const context = createContext({ NextAuthJWT });
  return new ApolloServer({
    schema,
    context,
    playground,
  });
}

module.exports = createServer;
