/* eslint-disable no-underscore-dangle */
import { produce } from '@decipad/utils';
import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
import { FC, ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ClientOptions,
  Provider as UrqlProvider,
  createClient,
  ssrExchange as createSsrExchange,
  fetchExchange,
} from 'urql';
import { graphCacheConfig } from '../cacheConfig';

const isServerSide = typeof window === 'undefined';

type SSRData =
  | NonNullable<Parameters<typeof createSsrExchange>[0]>['initialState']
  | undefined;

type WindowWithSSRData = typeof globalThis['window'] & {
  __URQL_DATA__: SSRData;
};

const ssrExchange = createSsrExchange({
  isClient: !isServerSide,
  initialState: !isServerSide
    ? (window as WindowWithSSRData).__URQL_DATA__
    : undefined,
});

const defaultClientOpts = () => {
  return {
    url: new URL(`/graphql`, window.location.origin).toString(),
    fetchOptions: {
      credentials: 'same-origin',
      headers: {},
    },
    requestPolicy: 'cache-first',
    suspense: true, // React Suspense
    exchanges: [
      devtoolsExchange,
      cacheExchange(graphCacheConfig),
      ssrExchange,
      fetchExchange,
    ],
  };
};

interface GraphqlProviderProps {
  readonly children: ReactNode;
}

export const GraphqlProvider: FC<GraphqlProviderProps> = ({ children }) => {
  const { search } = useLocation();
  const clientOpts = useMemo(() => {
    const params = new URLSearchParams(search);
    const secret = params.get('secret');
    return produce(defaultClientOpts(), (opts) => {
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
