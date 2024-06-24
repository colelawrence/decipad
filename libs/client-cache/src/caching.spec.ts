import { describe, expect, afterAll, beforeAll, it, afterEach } from 'vitest';
import { caching } from './caching';
import { timeout } from '@decipad/utils';

describe('client caching', () => {
  const previousCaches = globalThis.caches;
  const previousLocation = globalThis.location;
  const hits = new Map<string, number>();

  afterEach(() => {
    hits.clear();
  });

  beforeAll(() => {
    const cache = new Map<string, Response>();
    globalThis.caches = {
      open: (cacheName: string) => {
        expect(cacheName).toBe('decipad');
        return {
          match: async (key: string) => {
            const got = cache.get(key);
            if (got) {
              hits.set(key, (hits.get(key) || 0) + 1);
            }
            return got;
          },
          put: async (key: string, value: Response) => {
            // console.log('putting', key, value);
            cache.set(key, value);
          },
        };
      },
    } as unknown as typeof globalThis.caches;

    globalThis.location = new URL('https://decipad.com') as unknown as Location;
  });

  afterAll(() => {
    globalThis.caches = previousCaches;
    globalThis.location = previousLocation;
  });

  it('should cache the response', async () => {
    const gen = async (value: number) => ({ result: value * 2 });
    const cache = caching<
      { result: number },
      { result: string },
      [number],
      [number]
    >({
      name: 'test',
      rootValueKeys: ['result'],
      encode: (value) => ({ result: JSON.stringify(value.result) }),
      decode: (value) => ({ result: JSON.parse(value.result) }),
      getCacheKeyArgs: (value) => [value],
    })(gen);

    expect(await cache(2)).toEqual({ result: 4 });
    await timeout(100);

    expect(await cache(2)).toEqual({ result: 4 });
    await timeout(100);

    expect(await cache(3)).toEqual({ result: 6 });
    await timeout(100);

    expect(await cache(3)).toEqual({ result: 6 });

    expect(hits).toMatchInlineSnapshot(`
      Map {
        "https://decipad.com/cache/test/beb4dbf9af069aa2df7b147229965085" => 1,
        "https://decipad.com/cache/test/f2577a6fc29b900fe7d4c6321346be48" => 1,
      }
    `);
  });
});
