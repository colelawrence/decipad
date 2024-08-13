import type {
  Result,
  SerializedTypeKind,
  Type,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { serializeType } from '@decipad/language-types';

export function serializeResult<T extends SerializedTypeKind>(
  type: Type,
  value: Result.OneResult | null | undefined,
  meta: undefined | (() => Result.ResultMetadata<T>)
): Result.Result<T> {
  const serializedType = serializeType(type);
  return {
    value,
    type: serializedType,
    meta,
  } as Result.Result<T>;
}
