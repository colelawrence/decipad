import type { PromiseOrType } from '@decipad/utils';
import { getDefined } from '@decipad/utils';
import type { Value } from './Value';
import { isColumnLike } from './ColumnLike';

export function lowLevelGet(
  valueHere: Value | undefined,
  keys: number[]
): PromiseOrType<Value> {
  if (isColumnLike(valueHere)) {
    return valueHere.lowLevelGet(...keys);
  } else if (keys.length) {
    throw new Error('panic: lowLevelGet called with too many coordinates');
  } else {
    return getDefined(
      valueHere,
      'panic: lowLevelGet called with undefined value'
    );
  }
}
