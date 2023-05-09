import { PromiseOrType } from '@decipad/utils';

type TransformFunction<I, R> = (arg: I, index: number) => PromiseOrType<R>;

export const map = async function* map<I, R>(
  gen: AsyncGenerator<I> | AsyncIterable<I>,
  fn: TransformFunction<I, R>
): AsyncGenerator<R> {
  let index = -1;
  for await (const value of gen) {
    index += 1;
    yield await fn(value, index);
  }
};
