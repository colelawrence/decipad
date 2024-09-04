import { ScopedRealm, makeInferContext } from '../scopedRealm';
import { CURRENT_COLUMN_SYMBOL, mapWithPrevious } from './previous';
import { test, expect, describe, beforeAll } from 'vitest';

describe('mapWithPrevious', () => {
  const rows = [1, 2, 4];
  const foundPrevious = [];
  let rollySum;
  const realm = new ScopedRealm(makeInferContext());

  beforeAll(async () => {
    rollySum = await mapWithPrevious(
      realm,
      new Map(),
      async function* mapper() {
        for (const row of rows) {
          const previousValue =
            realm.previousRow?.get(CURRENT_COLUMN_SYMBOL) || null;
          foundPrevious.push(previousValue);

          yield (previousValue || 0) + row;
        }
      }
    );
  });

  test('realm.previousRow should be set to null at the end', () => {
    expect(realm.previousRow).toBeUndefined();
  });

  test('accumulator should work', () => {
    expect(rollySum).toMatchInlineSnapshot(`
      [
        1,
        3,
        7,
      ]
    `);
  });

  test('list of previous values is correct', () => {
    expect(foundPrevious).toMatchInlineSnapshot(`
      [
        null,
        1,
        3,
      ]
    `);
  });
});
