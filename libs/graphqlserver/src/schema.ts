import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from './resolvers';
import { typeDefs } from '@decipad/graphqlserver-types';

export default function createSchema() {
  return makeExecutableSchema({
    typeDefs,
    resolvers,
  });
}
