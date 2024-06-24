/* eslint-disable no-underscore-dangle */
import type { PromiseOrType } from '@decipad/utils';
import { WithFromArray } from './types';
import { from } from './from';

export const memoizing = async function* memoizing<T>(
  genP: PromiseOrType<
    WithFromArray<T> & (AsyncGenerator<T> | AsyncIterable<T>)
  >,
  done: (all: Array<T>, partial: boolean) => void,
  max = Infinity
): AsyncGenerator<T> {
  const gen = await genP;
  if (gen.__fromArray) {
    const all = await gen.__fromArray;
    yield* from(all);
    done(all, false);
    return;
  }
  const acc = [];
  let partial = false;
  for await (const v of gen) {
    if (!partial) {
      if (acc.length < max) {
        acc.push(v);
      } else {
        partial = true;
      }
    }
    yield v;
  }
  done(acc, partial);
};
