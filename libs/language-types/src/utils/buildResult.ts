import type {
  Result,
  SerializedType,
  SerializedTypeKind,
} from '@decipad/language-interfaces';

export const buildResult = <TK extends SerializedTypeKind>(
  type: Extract<SerializedType, { kind: TK }>,
  value: Result.OneResult
): Result.Result<TK> => {
  return { type, value } as Result.Result<TK>;
};
