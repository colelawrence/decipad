import { all } from '@decipad/generator-utils';

export const materialize = <T>(gen: AsyncGenerator<T>): Promise<Array<T>> =>
  all(gen);
