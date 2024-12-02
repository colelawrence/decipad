import { it, expect } from 'vitest';
import { isLonger } from './isLonger';

it('counts to generator limit', async () => {
  async function* smallGenerator() {
    yield 1;
    yield 1;
    yield 1;
  }

  await expect(isLonger(smallGenerator(), 10)).resolves.toBeFalsy();
});

it('stops count at hard stop', async () => {
  async function* smallGenerator() {
    yield 1;
    yield 1;
    yield 1;
  }

  await expect(isLonger(smallGenerator(), 2)).resolves.toBeTruthy();
});

it('returns the max when generator and max are the same', async () => {
  async function* smallGenerator() {
    yield 1;
    yield 1;
    yield 1;
  }

  await expect(isLonger(smallGenerator(), 3)).resolves.toBeTruthy();
});

it('works for bigger generators', async () => {
  async function* smallGenerator() {
    for (let i = 0; i < 1000; i++) {
      yield 1;
    }
  }

  await expect(isLonger(smallGenerator(), 500)).resolves.toBeTruthy();
});

it('returns max if an array is provided', async () => {
  async function* smallGenerator() {
    while (true) {
      yield 5;
    }
  }

  smallGenerator.__fromArray = [1, 2, 3, 4];

  await expect(isLonger(smallGenerator(), 4)).resolves.toBeTruthy();
});

it('uses array length if that is smaller than the max', async () => {
  async function* smallGenerator() {
    while (true) {
      yield 5;
    }
  }

  const gen = smallGenerator();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (gen as any).__fromArray = [1, 2, 3, 4];

  await expect(isLonger(gen, 10)).resolves.toBeFalsy();
});
