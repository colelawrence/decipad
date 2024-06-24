/* eslint-disable no-console */
import md5 from 'md5';
import { canonicalize } from 'json-canonicalize';
import { type PromiseOrType } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { captureException } from '@sentry/browser';
import { CachingConfig } from './types';
import { encodingToBuffer } from './encode';
import { PROTOCOL_VERSION } from './constants';
import { decodeFromBuffer } from './decode';
import { debug } from './debug';

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
  const cache = globalThis.caches.open('decipad');

  const encodeToBuffer = encodingToBuffer({
    rootValueKeys: config.rootValueKeys,
  });
  const encode = async (value: TValue): Promise<Response> => {
    const buffer = createResizableArrayBuffer();
    const dataView = new Value.GrowableDataView(buffer);
    let offset = 0;
    dataView.setUint8(offset, PROTOCOL_VERSION);
    offset += 1;
    const encoded = await config.encode(value);
    const length = await encodeToBuffer(encoded, buffer, dataView, offset);
    const responseBody = dataView.seal(length);
    debug('encoded response body', responseBody);
    return new Response(responseBody);
  };

  const decode = async (cachedResponse: Response): Promise<TValue> => {
    const buffer = await cachedResponse.arrayBuffer();
    debug('decoding response body', buffer);
    const dataView = new DataView(buffer);
    let offset = 0;
    const protocolVersion = dataView.getUint8(offset);
    offset += 1;
    if (protocolVersion !== PROTOCOL_VERSION) {
      throw new TypeError(
        `Protocol version mismatch. Expected ${PROTOCOL_VERSION}, got ${protocolVersion}`
      );
    }
    const encoded = await decodeFromBuffer<TEncodedValue>(dataView, offset);
    return config.decode(encoded);
  };

  return (gen: (...args: TArgs) => PromiseOrType<TValue>) =>
    async (...args: TArgs): Promise<TValue> => {
      const key = getArgsKey(config.name, ...config.getCacheKeyArgs(...args));
      const response = await (await cache).match(key);
      if (response) {
        try {
          const decoded = await decode(response);
          debug('decoded response:', decoded);
          return decoded;
        } catch (err) {
          console.error('Error decoding result from cache', err);
          captureException(err);
        }
      } else {
        debug('Cache miss for key', key);
      }
      const value = await gen(...args);
      encode(value)
        .then(async (encodedValue) => {
          (await cache)
            .put(key, encodedValue)
            .then(() => {
              debug('Cached value for key', key);
            })
            .catch((err) => {
              console.error('Failed to cache value', err);
            });
        })
        .catch((err) => {
          console.error('Failed to cache value', err);
        });
      return value;
    };
};
