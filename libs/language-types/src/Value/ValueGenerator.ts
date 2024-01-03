import type { Value } from './Value';

export type ValueGenerator = AsyncGenerator<Value>;

export type ValueGeneratorFunction = (
  start?: number,
  end?: number
) => AsyncGenerator<Value>;
