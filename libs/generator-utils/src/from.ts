/* eslint-disable no-underscore-dangle */
import type { PromiseOrType } from '@decipad/utils';
import { WithFromArray } from './types';

async function* fromImpl<T>(
  values: PromiseOrType<Array<T>>
): WithFromArray<T> & AsyncGenerator<T> {
  for (const v of await values) {
    yield v;
  }
}

export const from = <T>(
  values: PromiseOrType<Array<T>>
): WithFromArray<T> & AsyncGenerator<T> => {
  const gen = fromImpl(values);
  (gen as WithFromArray<T>).__fromArray = values;
  return gen;
};
