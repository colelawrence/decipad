import { PromiseOrType } from '@decipad/utils';

export const memoizing = async function* memoizing<T>(
  gen: PromiseOrType<AsyncGenerator<T> | AsyncIterable<T>>,
  done: (all: Array<T>, partial: boolean) => void,
  max = Infinity
) {
  const acc = [];
  let partial = false;
  for await (const v of await gen) {
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
