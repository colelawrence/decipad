import type { Dimension } from '@decipad/language-interfaces';
import type { PromiseOrType } from '@decipad/utils';

export const getDimensionLength = (
  d: Dimension['dimensionLength']
): PromiseOrType<number> => {
  if (typeof d === 'number') {
    return d;
  }
  return d();
};
