/* eslint-disable no-underscore-dangle */
import { all } from './all';
import { count } from './count';
import { from } from './from';
import { memoizing } from './memoizing';

describe('from, all, count, memoizing', () => {
  it('can use all on gen', async () => {
    const gen = async function* gen() {
      yield 1;
      yield 2;
      yield 3;
    };
    expect(await all(gen())).toEqual([1, 2, 3]);
  });

  it('can use all on gen from from', async () => {
    const source = [1, 2, 3];
    const gen = from(source);
    expect(gen.__fromArray).toBe(source);
    expect(await all(gen)).toBe(source);
    expect(await all(gen)).toEqual([1, 2, 3]);
  });

  it('can count from gen', async () => {
    const gen = async function* gen() {
      yield 1;
      yield 2;
      yield 3;
    };
    expect(await count(gen())).toEqual(3);
  });

  it('can count from from', async () => {
    const source = [1, 2, 3];
    const gen = from(source);
    expect(await count(gen)).toEqual(3);
  });

  it('can run partial memoizing from from', async () => {
    const source = [1, 2, 3];
    const gen = from(source);
    let doneCalled = false;
    const memoGen = memoizing(
      gen,
      (result, partial) => {
        // because memozing is getting the result from the array directly, it
        // does not respect the max parameter
        doneCalled = true;
        expect(result).toEqual([1, 2, 3]);
        expect(partial).toBe(false);
      },
      2
    );
    expect(await all(memoGen)).toEqual([1, 2, 3]);
    expect(doneCalled).toBe(true);
  });

  it('can run partial memoizing from gen', async () => {
    const gen = async function* gen() {
      yield 1;
      yield 2;
      yield 3;
    };
    let doneCalled = false;
    const memoGen = memoizing(
      gen(),
      (result, partial) => {
        doneCalled = true;
        expect(result).toEqual([1, 2]);
        expect(partial).toBe(true);
      },
      2
    );
    expect(await all(memoGen)).toEqual([1, 2, 3]);
    expect(doneCalled).toBe(true);
  });
});
