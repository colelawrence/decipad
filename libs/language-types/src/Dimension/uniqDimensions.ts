import { getInstanceof, zip } from '@decipad/utils';
import { isColumnLike } from '../Value/ColumnLike';
import type { DimensionId, HypercubeArg } from './types';
import stringify from 'json-stringify-safe';

export const uniqDimensions = async (
  args: HypercubeArg[]
): Promise<DimensionId[]> => {
  const retDimensions: DimensionId[] = [];
  const observedDimensionIds = new Set<DimensionId>();

  for (const [arg, argDimIds] of args) {
    if (!isColumnLike(arg)) continue;

    try {
      // eslint-disable-next-line no-await-in-loop
      for (const [, dimId] of zip(await arg.dimensions(), argDimIds)) {
        if (!observedDimensionIds.has(dimId)) {
          observedDimensionIds.add(dimId);
          retDimensions.push(dimId);
        }
      }
    } catch (e) {
      try {
        getInstanceof(e, Error).message += `: at ${stringify({
          // eslint-disable-next-line no-await-in-loop
          argDimensions: await arg.dimensions(),
          argDimIds,
        })}`;
      } catch (e2) {
        // ignore
      }
      throw e;
    }
  }

  return retDimensions;
};
