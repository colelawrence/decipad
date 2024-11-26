import {
  Unknown,
  type Result,
  type SerializedTypeKind,
  type Type,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { buildResult, serializeType } from '@decipad/language-types';

export function serializeResult<T extends SerializedTypeKind>(
  type: Type,
  value: Result.OneResult | null | undefined,
  meta: undefined | (() => Result.ResultMetadata<T>)
): Result.Result<T> {
  const serializedType = serializeType(type) as Result.Result<T>['type'];
  return buildResult<T>(
    serializedType,
    (value ?? Unknown) as Result.OneResult,
    meta
  );
}
