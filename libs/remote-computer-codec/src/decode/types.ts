import type { Result, SerializedType } from '@decipad/language-interfaces';
import type { PromiseOrType } from '@decipad/utils';

export type RecursiveDecoder = (
  type: SerializedType,
  buffer: DataView,
  offset: number,
  decoders: Record<SerializedType['kind'], RecursiveDecoder>
) => PromiseOrType<[Result.OneResult, number]>;

export type ValueDecoder = (
  buffer: DataView,
  offset: number
) => PromiseOrType<[Result.OneResult, number]>;
