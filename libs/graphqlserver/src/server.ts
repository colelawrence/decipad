import { ApolloServer } from 'apollo-server-lambda';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import createSchema from './schema';
import createContext from './context';
import playground from './playground';
import monitor from './monitor';

export default function createServer() {
  const schema = createSchema();
  const context = createContext();
  return new ApolloServer({
    schema,
    context,
    plugins: [
      monitor,
      ApolloServerPluginLandingPageGraphQLPlayground(playground),
    ],
  });
}
