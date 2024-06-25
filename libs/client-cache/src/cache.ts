import { Cache, CacheConfig } from './types';
import { debug } from './debug';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { PROTOCOL_VERSION } from './constants';
import { decodeFromBuffer } from './decode';
import { encodingToBuffer } from './encode';

export const createCache = <TValue, TEncodedValue extends object>(
  config: CacheConfig<TValue, TEncodedValue>
): Cache<TValue> => {
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

  const get = async (key: string): Promise<TValue | undefined> => {
    const response = await (await cache).match(key);
    if (response) {
      const decoded = await decode(response);
      debug('decoded response:', decoded);
      return decoded;
    }
    return undefined;
  };

  const set = async (key: string, value: TValue): Promise<void> => {
    const encodedValue = await encode(value);
    return (await cache).put(key, encodedValue);
  };

  return {
    get,
    set,
  };
};
