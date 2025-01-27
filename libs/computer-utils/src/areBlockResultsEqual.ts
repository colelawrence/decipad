import { dequal } from '@decipad/utils';
import type {
  IdentifiedResult,
  IdentifiedError,
} from '@decipad/computer-interfaces';

type BlockResult = IdentifiedResult | IdentifiedError;

export const areBlockResultsEqual = <T extends BlockResult | undefined>(
  a: T,
  b: T
): boolean => {
  if (a == null || b == null) {
    return false;
  }

  if (a.type === 'identified-error') {
    return dequal(a, b);
  }
  if (b.type === 'identified-error') {
    return false;
  }
  return a.epoch === b.epoch;
};
