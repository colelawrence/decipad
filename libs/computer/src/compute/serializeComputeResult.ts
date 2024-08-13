/* eslint-disable no-restricted-imports */
import { Value as TValue, Result } from '@decipad/language-interfaces';
import { Type, Value } from '@decipad/language-types';
import { tableValueToTableResultValue } from '@decipad/language';
import { serializeResult } from '@decipad/computer-utils';

export const serializeComputeResult = (
  type: Type,
  value: TValue.Value,
  data: Result.OneResult
): Result.Result => {
  if (Value.isTableValue(value)) {
    return serializeResult(
      type,
      value && tableValueToTableResultValue(value),
      value.meta
    );
  }
  if (Value.isColumnLike(value)) {
    return serializeResult(type, data, value.meta);
  }
  return serializeResult(type, data, undefined);
};
