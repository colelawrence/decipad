import { dequal } from '@decipad/utils';
import type { IdentifiedResult, IdentifiedError } from '../types';

type BlockResult = IdentifiedResult | IdentifiedError;

export const areBlockResultsEqual = (
  a: BlockResult,
  b: BlockResult
): boolean => {
  if (a.type === 'identified-error') {
    return dequal(a, b);
  }
  if (b.type === 'identified-error') {
    return false;
  }
  return a.epoch === b.epoch;
};
