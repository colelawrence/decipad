import {
  SerializedType,
  Unknown,
  type Result,
  type SerializedTypeKind,
} from '@decipad/language-interfaces';
import { validateResult } from '../validateResult/validate';

export const buildResult = <TK extends SerializedTypeKind = SerializedTypeKind>(
  type: Result.Result<TK>['type'],
  value: Result.OneResult,
  meta?: undefined | (() => Result.ResultMetadata<TK>)
): Result.Result<TK> => {
  const newValue = validateResult(type, value);
  if (newValue == null) {
    return {
      type: {
        kind: 'type-error',
        errorCause: {
          errType: 'free-form',
          message: `Internal error: validation failed for result of type ${type.kind}`,
        },
      } as SerializedType,
      value: Unknown,
      meta,
    } as Result.Result<TK>;
  }
  return { type, value, meta } as Result.Result<TK>;
};
