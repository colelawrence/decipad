import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  gql,
  ApolloLink,
  StoreObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import baseUrl from './base-url';

interface IWithAuthArgs {
  token: string;
  link?: ApolloLink;
}

export default ({ apiPort }: { apiPort: number }) => ({
  withAuth(args: IWithAuthArgs): ApolloClient<StoreObject> {
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

  withoutAuth() {
    const uri = `${baseUrl(apiPort)}/graphql`;

    return new ApolloClient({
      link: createHttpLink({ uri }),
      cache: new InMemoryCache(),
    });
  },
});

export { gql };
