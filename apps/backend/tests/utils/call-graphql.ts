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

interface WithAuthArgs {
  token: string
  link?: ApolloLink
}

function withAuth(args: WithAuthArgs): ApolloClient<StoreObject> {
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

  const uri = `${baseUrl()}/graphql`;

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
}

function withoutAuth() {
  const uri = `${baseUrl()}/graphql`;
  const httpLink = createHttpLink({ uri });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
}

export { withAuth, withoutAuth };
export { gql };
