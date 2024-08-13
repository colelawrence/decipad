import type { Result, SerializedType } from '@decipad/language-interfaces';
import type { PromiseOrType } from '@decipad/utils';

export type RecursiveEncoder = (
  result: Result.Result,
  buffer: DataView,
  offset: number,
  encoders: Record<SerializedType['kind'], RecursiveEncoder>
) => PromiseOrType<number>;
