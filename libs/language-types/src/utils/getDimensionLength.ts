import type { PromiseOrType } from '@decipad/utils';
import type { Dimension } from '../Dimension/Dimension';

export const getDimensionLength = (
  d: Dimension['dimensionLength']
): PromiseOrType<number> => {
  if (typeof d === 'number') {
    return d;
  }
  return d();
};
