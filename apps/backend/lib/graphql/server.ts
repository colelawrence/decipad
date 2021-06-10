import { ApolloServer } from 'apollo-server-lambda';
import createSchema from './schema';
import createContext from './context';
import playground from './playground';

export default function createServer() {
  const schema = createSchema();
  const context = createContext();
  return new ApolloServer({
    schema,
    context,
    playground,
  });
}
