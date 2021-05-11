import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  gql,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import baseUrl from './base-url';

function withAuth({ token }) {
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const uri = `${baseUrl()}/graphql`;
  const httpLink = createHttpLink({
    uri,
    credentials: 'same-origin',
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
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
