import { enumerate } from '../utils';
import type { Type } from '../type';

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
