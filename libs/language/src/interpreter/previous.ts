// Accumulate values into a list by consuming an async iterable.

import { Value } from './Value';
import { Realm } from './Realm';

// Accumulates values into an array by consuming async iterable of values.
// Manages realm.previousValue too.
export const mapWithPrevious = async (
  realm: Realm,
  iter: () => AsyncIterable<Value>
) => {
  const ret: Value[] = [];

  // mapWithPrevious can be called again during iter()
  // For example with nested `given`
  const savedPrevious = realm.previousValue;
  realm.previousValue = null;

  for await (const result of iter()) {
    ret.push(result);
    realm.previousValue = result;
  }

  realm.previousValue = savedPrevious;

  return ret;
};
