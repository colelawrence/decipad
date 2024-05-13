import type { PromiseOrType } from '@decipad/utils';

type TransformFunction<I, R> = (
  arg: I,
  index: number,
  previous?: I
) => PromiseOrType<R>;

export const map = async function* map<I, R>(
  gen: AsyncGenerator<I> | AsyncIterable<I>,
  fn: TransformFunction<I, R>
): AsyncGenerator<R> {
  let index = -1;
  let previous: I | undefined;
  for await (const value of gen) {
    index += 1;
    const newValue = await fn(value, index, previous);
    previous = value;
    yield newValue;
  }
};
