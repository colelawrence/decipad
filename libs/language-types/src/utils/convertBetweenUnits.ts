import type DeciNumber from '@decipad/number';
import type { Unit } from '@decipad/language-units';
import { convertBetweenUnits as realConvertBetweenUnits } from '@decipad/language-units';
import { InferError } from '../InferError';

interface ImprecisionOpts {
  tolerateImprecision?: boolean;
}

export const convertBetweenUnits = (
  n: DeciNumber,
  from: Unit.Unit[],
  to: Unit.Unit[],
  opts: ImprecisionOpts = {}
): DeciNumber => {
  try {
    return realConvertBetweenUnits(n, from, to, opts);
  } catch (err) {
    throw InferError.cannotConvertBetweenUnits(from, to);
  }
};
