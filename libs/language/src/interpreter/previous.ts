// Accumulate values into a list by consuming an async iterable.

import { ColumnLikeValue, Value } from '../value';
import { Realm } from './Realm';

export const CURRENT_COLUMN_SYMBOL = Symbol('current column');

// Accumulates values into an array by consuming async iterable of values.
// Manages realm.previousValue too.
export const mapWithPrevious = async (
  realm: Realm,
  otherColumns: Map<string, ColumnLikeValue>,
  iter: () => AsyncIterable<Value>
) => {
  const ret: Value[] = [];

  // mapWithPrevious can be called again during iter()
  // For example with nested `given`
  const savedPreviousRow = realm.previousRow;
  realm.previousRow = null;

  for await (const result of iter()) {
    const previousRow = new Map<string | symbol, Value>();
    await Promise.all(
      [...otherColumns.entries()].map(async ([key, value]) => {
        const v = await value.atIndex(ret.length);
        if (v != null) {
          previousRow.set(key, v);
        }
      })
    );

    ret.push(result);
    previousRow.set(CURRENT_COLUMN_SYMBOL, result);
    realm.previousRow = previousRow;
  }

  realm.previousRow = savedPreviousRow;

  return ret;
};
