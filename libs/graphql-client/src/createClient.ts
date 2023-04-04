import type { ClientOptions } from 'urql';
import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
import {
  dedupExchange,
  fetchExchange,
  createClient as urqlCreateClient,
} from 'urql';
import merge from 'deepmerge';
import { graphCacheConfig } from './cacheConfig';

const defaultClientOpts = () => ({
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
});

export const clientOptions = (options: Partial<ClientOptions>): ClientOptions =>
  merge(defaultClientOpts(), options);

export const createClient = (options: Partial<ClientOptions> = {}) =>
  urqlCreateClient(clientOptions(options));
