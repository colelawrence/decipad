import { expect, describe, it } from 'vitest';
import { all } from './all';
import { first } from './first';
import { unzip } from './unzip';

describe('generators unzip', () => {
  it('can be unzipped at the same time', async () => {
    async function* gen() {
      yield [1, 'a'];
      yield [2, 'b'];
      yield [3, 'c'];
    }
    const unzipped = unzip(gen(), 2);
    const [gen1, gen2] = await first(unzipped);
    expect(await Promise.all([all(gen1), all(gen2)])).toEqual([
      [1, 2, 3],
      ['a', 'b', 'c'],
    ]);
  });

  it('can be unzipped separately', async () => {
    async function* gen() {
      yield [1, 'a'];
      yield [2, 'b'];
      yield [3, 'c'];
    }
    const unzipped = unzip(gen(), 2);
    const [gen1, gen2] = await first(unzipped);
    expect(await all(gen1)).toEqual([1, 2, 3]);
    expect(await all(gen2)).toEqual(['a', 'b', 'c']);
  });
});
