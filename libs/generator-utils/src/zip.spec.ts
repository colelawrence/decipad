import { expect, describe, it } from 'vitest';
import { all } from './all';
import { zip } from './zip';

describe('generators zip', () => {
  it('should zip two generators of the same size', async () => {
    async function* gen1() {
      yield 1;
      yield 2;
      yield 3;
    }

    async function* gen2() {
      yield 'a';
      yield 'b';
      yield 'c';
    }

    const zipped = zip(gen1(), gen2());
    expect(await all(zipped)).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ]);
  });

  it('should zip two generators of the different size', async () => {
    async function* gen1() {
      yield 1;
      yield 2;
      yield 3;
    }

    async function* gen2() {
      yield 'a';
      yield 'b';
    }

    const zipped = zip(gen1(), gen2());
    expect(await all(zipped)).toEqual([
      [1, 'a'],
      [2, 'b'],
    ]);
  });
});
