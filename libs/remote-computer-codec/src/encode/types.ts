import type { Result, SerializedType } from '@decipad/language-interfaces';
import type { PromiseOrType } from '@decipad/utils';

export type RecursiveEncoder = (
  type: SerializedType,
  buffer: DataView,
  value: Result.OneResult,
  offset: number,
  encoders: Record<SerializedType['kind'], RecursiveEncoder>
) => PromiseOrType<number>;
