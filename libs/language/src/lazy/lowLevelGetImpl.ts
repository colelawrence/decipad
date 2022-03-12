import { getDefined } from '@decipad/utils';
import { isColumnLike, Value } from '../interpreter/Value';

export function lowLevelGet(valueHere: Value, keys: number[]) {
  getDefined(valueHere, 'panic: lowLevelGet called with undefined value');

  if (isColumnLike(valueHere)) {
    return valueHere.lowLevelGet(...keys);
  } else if (keys.length) {
    throw new Error('panic: lowLevelGet called with too many coordinates');
  } else {
    return valueHere;
  }
}
