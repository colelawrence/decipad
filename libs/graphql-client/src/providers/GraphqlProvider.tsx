/* eslint-disable no-underscore-dangle */
import { produce } from '@decipad/utils';
import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ClientOptions,
  Provider as UrqlProvider,
  createClient,
  ssrExchange as createSsrExchange,
  fetchExchange,
} from 'urql';
import { graphCacheConfig } from '../cacheConfig';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';

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

const defaultClientOpts = (session?: Session) => {
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
      cacheExchange(graphCacheConfig(session)),
      ssrExchange,
      fetchExchange,
    ],
  };
};

interface GraphqlProviderProps {
  readonly children: ReactNode;
}

const useMySession = () => {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    getSession().then((session) => {
      setSession(session);
    });
  }, []);

  return session;
};

export const GraphqlProvider: FC<GraphqlProviderProps> = ({ children }) => {
  const { search } = useLocation();
  const session = useMySession();

  const clientOpts = useMemo(() => {
    const params = new URLSearchParams(search);
    const secret = params.get('secret');
    return produce(defaultClientOpts(session ?? undefined), (opts) => {
      if (secret) {
        // eslint-disable-next-line no-param-reassign
        opts.fetchOptions.headers = {
          ...(opts.fetchOptions.headers || {}),
          authorization: `Bearer ${secret}`,
        };
      }
    });
  }, [search, session]);

  const client = useMemo(
    () => createClient(clientOpts as ClientOptions),
    [clientOpts]
  );
  return <UrqlProvider value={client}>{children}</UrqlProvider>;
};
