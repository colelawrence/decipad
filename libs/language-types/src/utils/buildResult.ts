import type { OneResult, Result } from '../Result';
import type { SerializedType, SerializedTypeKind } from '../SerializedType';

export const buildResult = <TK extends SerializedTypeKind>(
  type: Extract<SerializedType, { kind: TK }>,
  value: OneResult
): Result<TK> => {
  return { type, value } as Result<TK>;
};
