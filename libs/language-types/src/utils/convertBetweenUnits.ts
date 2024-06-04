import type { DeciNumberBase } from '@decipad/number';
import type { Unit } from '@decipad/language-interfaces';
import { convertBetweenUnits as realConvertBetweenUnits } from '@decipad/language-units';
import { InferError } from '../InferError';

interface ImprecisionOpts {
  tolerateImprecision?: boolean;
}

export const convertBetweenUnits = (
  n: DeciNumberBase,
  from: Unit[],
  to: Unit[],
  opts: ImprecisionOpts = {}
): DeciNumberBase => {
  try {
    return realConvertBetweenUnits(n, from, to, opts);
  } catch (err) {
    throw InferError.cannotConvertBetweenUnits(from, to);
  }
};
