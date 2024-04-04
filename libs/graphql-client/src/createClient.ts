import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
import merge from 'deepmerge';
import type { Client, ClientOptions } from 'urql';
import { fetchExchange, createClient as urqlCreateClient } from 'urql';
import { fetch as myFetch } from '@decipad/fetch';
import { graphCacheConfig } from './cacheConfig';
import { type Session } from 'next-auth';

type WithSession = {
  session: Session;
};

const cache = ({ session }: Partial<WithSession>) =>
  cacheExchange(graphCacheConfig(session));

const defaultClientOpts = (session: Partial<WithSession>): ClientOptions => ({
  url: new URL(`/graphql`, window.location.origin).toString(),
  fetch: myFetch,
  fetchOptions: {
    credentials: 'same-origin',
    headers: {},
  },
  requestPolicy: 'cache-first',
  suspense: true,
  exchanges: [devtoolsExchange, cache(session), fetchExchange],
});

export const clientOptions = (
  options: Partial<ClientOptions & WithSession>
): ClientOptions & Partial<WithSession> =>
  merge(defaultClientOpts(options), options);

export const createClient = (
  options: Partial<ClientOptions & WithSession> = {}
): Client => urqlCreateClient(clientOptions(options));
