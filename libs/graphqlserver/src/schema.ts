import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from './resolvers';
import typeDefs from './typedefs';

export default function createSchema() {
  return makeExecutableSchema({
    typeDefs,
    resolvers,
  });
}
