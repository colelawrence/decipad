import { PromiseOrType } from '@decipad/utils';

export const from = async function* from<T>(
  values: PromiseOrType<ReadonlyArray<T>>
): AsyncGenerator<T> {
  for (const v of await values) {
    yield v;
  }
};
