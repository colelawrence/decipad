/* eslint-disable no-underscore-dangle */
import type { PromiseOrType } from '@decipad/utils';
import { WithFromArray } from './types';
import { from } from './from';

type TransformFunction<I, R> = (
  arg: I,
  index: number,
  previous?: I
) => PromiseOrType<R>;

export const map = async function* map<I, R>(
  gen: WithFromArray<I> & (AsyncGenerator<I> | AsyncIterable<I>),
  fn: TransformFunction<I, R>
): AsyncGenerator<R> {
  if (gen.__fromArray) {
    const arr = await gen.__fromArray;
    return yield* from(arr.map((v, i) => fn(v, i, arr[i - 1])));
  }
  let index = -1;
  let previous: I | undefined;
  for await (const value of gen) {
    index += 1;
    const newValue = await fn(value, index, previous);
    previous = value;
    yield newValue;
  }
};
