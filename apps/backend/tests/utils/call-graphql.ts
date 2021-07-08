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
  token: string;
  link?: ApolloLink;
}

export function withAuth(args: WithAuthArgs): ApolloClient<StoreObject> {
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

export function withoutAuth() {
  const uri = `${baseUrl()}/graphql`;

  return new ApolloClient({
    link: createHttpLink({ uri }),
    cache: new InMemoryCache(),
  });
}

export { gql };
