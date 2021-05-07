const {
  ApolloServer,
  gql,
  makeExecutableSchema,
} = require('apollo-server-lambda');
const createGraphqlHandler = require('@architect/shared/graphql');
let NextAuthJWT = require('next-auth/jwt');

if (typeof NextAuthJWT.encode !== 'function') {
  NextAuthJWT = NextAuthJWT.default;
}

exports.handler = createGraphqlHandler({
  ApolloServer,
  gql,
  makeExecutableSchema,
  NextAuthJWT,
});
