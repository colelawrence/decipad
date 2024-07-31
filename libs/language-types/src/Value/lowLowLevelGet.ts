import { getDefined } from '@decipad/utils';
import { firstOrUndefined } from '@decipad/generator-utils';
import type { Result } from '@decipad/language-interfaces';
import { isResultGenerator } from '../utils/isResultGenerator';

export async function lowLowLevelGet(
  valueHere: Result.OneResult | undefined,
  keys: number[]
): Promise<Result.OneResult> {
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
