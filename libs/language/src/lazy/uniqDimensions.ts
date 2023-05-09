import { isColumnLike } from '../value';
import { zip } from '../utils';
import type { Dimension, DimensionId } from './types';
import type { HypercubeArg } from './LazyOperation';

export const uniqDimensions = async (
  args: HypercubeArg[]
): Promise<[DimensionId[], Dimension[]]> => {
  const retDimensions = new Map<DimensionId, Dimension>();

  for (const [arg, argDimIds] of args) {
    if (!isColumnLike(arg)) continue;

    // eslint-disable-next-line no-await-in-loop
    for (const [argDim, dimId] of zip(await arg.dimensions(), argDimIds)) {
      if (!retDimensions.has(dimId)) {
        retDimensions.set(dimId, argDim);
      }
    }
  }

  return [[...retDimensions.keys()], [...retDimensions.values()]];
};
