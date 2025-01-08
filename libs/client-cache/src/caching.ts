/* eslint-disable no-console */
import md5 from 'md5';
import { canonicalize } from 'json-canonicalize';
import { captureException } from '@sentry/react';
import { type PromiseOrType } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
// eslint-disable-next-line no-restricted-imports
import { CachingConfig } from './types';
import { debug } from './debug';
import { createCache } from './cache';

const getArgsKey = <TArgs extends Array<unknown>>(
  name: string,
  ...args: TArgs
): string =>
  `${globalThis.location.origin}/cache/${encodeURIComponent(
    name
  )}/${encodeURIComponent(md5(canonicalize(args)))}`;

export const caching = <
  TValue extends object,
  TEncodedValue extends object,
  TArgs extends Array<unknown>,
  TCacheKeyArgs extends Array<unknown>
>(
  config: CachingConfig<TEncodedValue, TValue, TArgs, TCacheKeyArgs>
) => {
  const cache = createCache<TValue, TEncodedValue>(config);

  return (gen: (...args: TArgs) => PromiseOrType<TValue>) =>
    async (...args: TArgs): Promise<TValue> => {
      const key = getArgsKey(config.name, ...config.getCacheKeyArgs(...args));
      try {
        const cached = await cache.get(key);
        if (cached != null) {
          return cached;
        }
        debug('Cache miss for key', key);
      } catch (err) {
        console.error('Error decoding result from cache', err);
        captureException(err);
      }

      const value = await gen(...args);
      cache
        .set(key, value)
        .then(() => {
          debug('Cached value for key', key);
        })
        .catch((err) => {
          console.error('Failed to cache value', err);
        });
      return value;
    };
};
