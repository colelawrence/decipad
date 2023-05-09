import { PromiseOrType } from '@decipad/utils';

export const all = async <T>(
  gen: PromiseOrType<AsyncGenerator<T> | AsyncIterable<T>>
): Promise<Array<T>> => {
  const acc = [];
  for await (const v of await gen) {
    acc.push(v);
  }
  return acc;
};
