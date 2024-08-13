import type { Result, Value } from '@decipad/language-interfaces';
import { isColumnLike } from './ColumnLike';
import { isTableValue } from './Table';

export const getValueMeta = (
  value: Value.Value | undefined
): Result.ResultMetadata => {
  if (isColumnLike(value) || isTableValue(value)) {
    return value.meta?.();
  }
  return undefined;
};
