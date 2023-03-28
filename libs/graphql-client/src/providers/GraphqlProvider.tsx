import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
import produce from 'immer';
import { FC, ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  createClient,
  dedupExchange,
  fetchExchange,
  Provider as UrqlProvider,
  ClientOptions,
} from 'urql';
import { graphCacheConfig } from '../cacheConfig';

const defaultClientOpts = {
  url: new URL(`/graphql`, window.location.origin).toString(),
  fetchOptions: {
    credentials: 'same-origin',
    headers: {},
  },
  suspense: true, // React Suspense
  exchanges: [
    devtoolsExchange,
    dedupExchange,
    cacheExchange(graphCacheConfig),
    fetchExchange,
  ],
};

interface GraphqlProviderProps {
  readonly children: ReactNode;
}

export const GraphqlProvider: FC<GraphqlProviderProps> = ({ children }) => {
  const { search } = useLocation();
  const clientOpts = useMemo(() => {
    const params = new URLSearchParams(search);
    const secret = params.get('secret');
    return produce(defaultClientOpts, (opts) => {
      if (secret) {
        // eslint-disable-next-line no-param-reassign
        opts.fetchOptions.headers = {
          ...(opts.fetchOptions.headers || {}),
          authorization: `Bearer ${secret}`,
        };
      }
    });
  }, [search]);

  const client = useMemo(
    () => createClient(clientOpts as ClientOptions),
    [clientOpts]
  );
  return <UrqlProvider value={client}>{children}</UrqlProvider>;
};
