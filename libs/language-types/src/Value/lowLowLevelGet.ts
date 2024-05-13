import { getDefined } from '@decipad/utils';
import type { OneResult } from '../Result';
import { isResultGenerator } from '../utils';
import { firstOrUndefined } from '@decipad/generator-utils';

export async function lowLowLevelGet(
  valueHere: OneResult | undefined,
  keys: number[]
): Promise<OneResult> {
  if (isResultGenerator(valueHere)) {
    const [index, ...rest] = keys;
    return lowLowLevelGet(
      await firstOrUndefined(await valueHere(index, index + 1)),
      rest
    );
  } else if (keys.length) {
    throw new Error('panic: lowLevelGet called with too many coordinates');
  } else {
    return getDefined(
      await valueHere,
      'panic: lowLevelGet called with undefined value'
    );
  }
}
