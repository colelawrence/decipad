// eslint-disable-next-line no-restricted-imports
import type {
  Result,
  SerializedType,
  SerializedTypeKind,
} from '@decipad/language-types';
import { validateResult } from '../validateResult';

export const buildResult = <TK extends SerializedTypeKind>(
  type: Extract<SerializedType, { kind: TK }>,
  _value: Result.OneResult
): Result.Result<TK> => {
  const value = validateResult(type, _value);
  return { type, value } as Result.Result<TK>;
};
