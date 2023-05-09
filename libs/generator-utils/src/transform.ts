import { PromiseOrType } from '@decipad/utils';

type TransformFn<I, R> = (arg: I) => PromiseOrType<R>;

export const transform = <I, R>(fn: TransformFn<I, R>) =>
  async function* transformFn(gen: AsyncGenerator<I>): AsyncGenerator<R> {
    for await (const value of gen) {
      yield await fn(value);
    }
  };
