/* eslint-disable no-underscore-dangle */
import { from } from './from';
import { WithFromArray } from './types';

export const slice = async function* slice<T>(
  gen: WithFromArray<T> & AsyncGenerator<T>,
  start = 0,
  end = Infinity
): AsyncGenerator<T> {
  if (gen.__fromArray) {
    return yield* from((await gen.__fromArray).slice(start, end));
  }
  let n = -1;
  for await (const v of gen) {
    n += 1;
    if (n >= start && n < end) {
      yield v;
    }
  }
};
