import type {
  Result,
  SerializedType,
  SerializedTypeKind,
} from '@decipad/language-interfaces';

export const buildResult = <TK extends SerializedTypeKind>(
  type: Extract<SerializedType, { kind: TK }>,
  value: Result.OneResult
): Result.Result<TK> => {
  if (type.kind === 'column' && typeof value !== 'function') {
    throw new Error('trying to build mismatched column');
  }
  return { type, value } as Result.Result<TK>;
};
