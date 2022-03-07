import uniqBy from 'lodash.uniqby';
import { enumerate, getDefined } from '../utils';
import type { Type } from '../type';
import type { Dimension, HypercubeLike } from '../lazy';

export const uniqDimensions = (dimensions: Dimension[]) =>
  uniqBy(dimensions, 'dimensionId');

const getDimensionId = (type: Type, index: number) => type.indexedBy ?? index;

export function groupTypesByDimension(...args: Type[][]) {
  const allDimensions = new Map();
  for (const arg of args) {
    for (const [index, type] of enumerate(arg)) {
      const dimensionId = getDimensionId(type, index);
      const array = allDimensions.get(dimensionId) ?? [];

      array.push(type);

      allDimensions.set(dimensionId, array);
    }
  }
  return [...allDimensions.values()];
}

export function getAt(
  hc: HypercubeLike,
  coordinates: Map<string | number, number>
) {
  const uniqueDimensions = uniqDimensions(hc.dimensions);
  if (coordinates.size !== uniqueDimensions.length) {
    throw new Error(
      `panic: not enough keys: given ${[
        ...coordinates.keys(),
      ]} and wanted ${uniqueDimensions.map((d) => d.dimensionId)}`
    );
  }

  const linearArgs = hc.dimensions.map((dimVal) =>
    getDefined(coordinates.get(dimVal.dimensionId))
  );

  return hc.lowLevelGet(...linearArgs);
}
