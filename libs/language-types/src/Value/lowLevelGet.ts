import { getDefined } from '@decipad/utils';
import type { Value } from './Value';
import { isColumnLike } from './ColumnLike';

export async function lowLevelGet(
  valueHere: Value | undefined,
  keys: number[]
): Promise<Value> {
  getDefined(valueHere, 'panic: lowLevelGet called with undefined value');

  if (isColumnLike(valueHere)) {
    return valueHere.lowLevelGet(...keys);
  } else if (keys.length) {
    throw new Error('panic: lowLevelGet called with too many coordinates');
  } else {
    return Promise.resolve(getDefined(valueHere));
  }
}
