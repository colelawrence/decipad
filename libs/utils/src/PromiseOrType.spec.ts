import isPromise from 'is-promise';
import { bind, sequence } from './PromiseOrType';

describe('bind', () => {
  describe('when the input is a promise', () => {
    const input = Promise.resolve('hello');

    describe('when the function returns a promise', () => {
      const fn = (x: string) => Promise.resolve(`${x} world`);

      it('returns a promise', async () => {
        const result = bind(input, fn);
        expect(isPromise(result)).toBe(true);
        expect(await result).toBe('hello world');
      });
    });

    describe('when the function returns a value', () => {
      const fn = (x: string) => `${x} world`;

      it('returns a promise', async () => {
        const result = bind(input, fn);
        expect(isPromise(result)).toBe(true);
        expect(await result).toBe('hello world');
      });
    });
  });

  describe('when the input is a value', () => {
    const input = 'hello';

    describe('when the function returns a promise', () => {
      const fn = (x: string) => Promise.resolve(`${x} world`);

      it('returns a promise', async () => {
        const result = bind(input, fn);
        expect(isPromise(result)).toBe(true);
        expect(await result).toBe('hello world');
      });
    });

    describe('when the function returns a value', () => {
      const fn = (x: string) => `${x} world`;

      it('returns a value', () => {
        const result = bind(input, fn);
        expect(isPromise(result)).toBe(false);
        expect(result).toBe('hello world');
      });
    });
  });
});

describe('sequence', () => {
  const toThunk =
    <T>(x: T): (() => T) =>
    () =>
      x;

  it('sequences an array of values', () => {
    const input = ['hello', 'world'];
    const result = sequence(input.map(toThunk));
    expect(isPromise(result)).toBe(false);
    expect(result).toEqual(['hello', 'world']);
  });

  it('sequences an array of promises', async () => {
    const input = [Promise.resolve('hello'), Promise.resolve('world')];
    const result = sequence(input.map(toThunk));
    expect(isPromise(result)).toBe(true);
    expect(await result).toEqual(['hello', 'world']);
  });

  it('sequences an array of mixed values and promises', async () => {
    const input = ['hello', Promise.resolve('world')];
    const result = sequence(input.map(toThunk));
    expect(isPromise(result)).toBe(true);
    expect(await result).toEqual(['hello', 'world']);
  });

  it('performs promises in order', async () => {
    const resolvedOrder: string[] = [];

    const makePromise = (ms: number, value: string) =>
      new Promise<string>((resolve) => {
        setTimeout(() => {
          resolvedOrder.push(value);
          resolve(value);
        }, ms);
      });

    const input = [
      () => makePromise(100, 'a'),
      () => makePromise(50, 'b'),
      () => makePromise(10, 'c'),
      () => makePromise(200, 'd'),
    ];

    const result = await sequence(input);
    expect(result).toEqual(['a', 'b', 'c', 'd']);
    expect(resolvedOrder).toEqual(['a', 'b', 'c', 'd']);
  });
});
