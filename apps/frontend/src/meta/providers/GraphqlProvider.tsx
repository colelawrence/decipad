import { cacheExchange } from '@urql/exchange-graphcache';
import { FC, ReactNode } from 'react';
import {
  createClient,
  dedupExchange,
  fetchExchange,
  Provider as UrqlProvider,
} from 'urql';
import { graphCacheConfig } from '../../graphql/cacheConfig';

const client = createClient({
  url: new URL(`/graphql`, window.location.origin).toString(),
  fetchOptions: () => ({
    credentials: 'same-origin',
  }),
  suspense: true, // React Suspense
  exchanges: [dedupExchange, cacheExchange(graphCacheConfig), fetchExchange],
});

interface GraphqlProviderProps {
  readonly children: ReactNode;
}

export const GraphqlProvider: FC<GraphqlProviderProps> = ({ children }) => {
  return <UrqlProvider value={client}>{children}</UrqlProvider>;
};
