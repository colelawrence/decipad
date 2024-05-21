import type { Value } from '@decipad/language-interfaces';

export type ValueGenerator = AsyncGenerator<Value.Value>;

export type ValueGeneratorFunction = (
  start?: number,
  end?: number
) => AsyncGenerator<Value.Value>;
