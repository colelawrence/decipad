import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  gql,
  StoreObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import baseUrl from './base-url';
import { AuthReturnValue } from './auth';

interface CallGraphql {
  withAuth(args: AuthReturnValue): ApolloClient<StoreObject>;
  withoutAuth(): ApolloClient<StoreObject>;
}

export default ({ apiPort }: { apiPort: number }): CallGraphql => ({
  withAuth(args: AuthReturnValue): ApolloClient<StoreObject> {
    const { token, link: _link } = args;
    let link = _link;
    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      };
    });

    const uri = `${baseUrl(apiPort)}/graphql`;

    if (!link) {
      link = createHttpLink({
        uri,
        credentials: 'same-origin',
      });
    }

    return new ApolloClient({
      link: authLink.concat(link),
      cache: new InMemoryCache(),
    });
  },

  withoutAuth(): ApolloClient<StoreObject> {
    const uri = `${baseUrl(apiPort)}/graphql`;

    return new ApolloClient({
      link: createHttpLink({ uri }),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        },
      },
    });
  },
});

export { gql };
