/* eslint-disable no-underscore-dangle */
import { from } from './from';
import { WithFromArray } from './types';

type FilterFunction<T> = (value: T, index: number) => boolean;

export const filter = async function* filter<T>(
  values: WithFromArray<T> & AsyncGenerator<T>,
  filterFn: FilterFunction<T>
): AsyncGenerator<T> {
  if (values.__fromArray) {
    return yield* from((await values.__fromArray).filter(filterFn));
  }
  let index = -1;
  for await (const v of values) {
    index += 1;
    if (filterFn(v, index)) {
      yield v;
    }
  }
};
