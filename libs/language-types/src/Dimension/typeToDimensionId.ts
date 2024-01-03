import type { Type } from '../Type';
import { getDimensionId } from './getDimensionId';
import { linearizeType } from './linearizeType';
import type { DimensionId } from './types';
import type { ContextUtils } from '../ContextUtils';

export const typeToDimensionIds = (
  utils: ContextUtils,
  type: Type
): DimensionId[] => {
  const linear = linearizeType(type).slice(0, -1);
  return linear.map((t, i) => getDimensionId(utils, t, i));
};
