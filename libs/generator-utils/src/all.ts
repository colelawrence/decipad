/* eslint-disable no-underscore-dangle */
import type { PromiseOrType } from '@decipad/utils';
import { WithFromArray } from './types';

export const all = async <T>(
  genP: PromiseOrType<WithFromArray<T> & (AsyncGenerator<T> | AsyncIterable<T>)>
): Promise<Array<T>> => {
  const gen = await genP;
  if (gen.__fromArray) {
    return gen.__fromArray;
  }
  const acc = [];
  for await (const v of gen) {
    acc.push(v);
  }
  return acc;
};
