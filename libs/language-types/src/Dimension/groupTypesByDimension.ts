import { enumerate } from '@decipad/utils';
import { ContextUtils } from '../ContextUtils';
import { Type } from '../Type';
import { getDimensionId } from './getDimensionId';

export function groupTypesByDimension(
  ctx: ContextUtils,
  ...args: Type[][]
): Type[][] {
  const allDimensions = new Map<string | number, Type[]>();
  for (const arg of args) {
    for (const [index, type] of enumerate(arg)) {
      const dimensionId = getDimensionId(ctx, type, index);
      const array = allDimensions.get(dimensionId) ?? [];

      array.push(type);

      allDimensions.set(dimensionId, array);
    }
  }
  return [...allDimensions.values()];
}
