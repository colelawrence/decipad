import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
import merge from 'deepmerge';
import type { Client, ClientOptions } from 'urql';
import { fetchExchange, createClient as urqlCreateClient } from 'urql';
import { graphCacheConfig } from './cacheConfig';

const cache = cacheExchange(graphCacheConfig);

const defaultClientOpts = (): ClientOptions => ({
  url: new URL(`/graphql`, window.location.origin).toString(),
  fetchOptions: {
    credentials: 'same-origin',
    headers: {},
  },
  requestPolicy: 'cache-first',
  suspense: true,
  exchanges: [devtoolsExchange, cache, fetchExchange],
});

export const clientOptions = (options: Partial<ClientOptions>): ClientOptions =>
  merge(defaultClientOpts(), options);

export const createClient = (options: Partial<ClientOptions> = {}): Client =>
  urqlCreateClient(clientOptions(options));
