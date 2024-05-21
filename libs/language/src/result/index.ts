import type {
  Result,
  SerializedTypeKind,
  Type,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { serializeType } from '@decipad/language-types';
import { validateResult } from '../validateResult';

export { Column } from './Column';
export type { ColumnLikeResult } from './Column';

export function serializeResult<T extends SerializedTypeKind>(
  type: Type,
  _value: Result.OneResult | null | undefined
): Result.Result<T> {
  const value = validateResult(type, _value);
  const serializedType = serializeType(type);
  return {
    value,
    type: serializedType,
  } as Result.Result<T>;
}
