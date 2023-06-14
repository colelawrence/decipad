import { enumerate } from '../utils';
import type { Type } from '../type';
import { Context } from '../infer';

export const resolveIndexDelegation = (
  ctx: Context,
  _indexName: string
): string => {
  let indexName = _indexName;
  const sourceType = ctx.stack.get(indexName, 'function');
  if (
    sourceType &&
    sourceType.delegatesIndexTo &&
    sourceType.delegatesIndexTo !== indexName
  ) {
    indexName = resolveIndexDelegation(ctx, sourceType.delegatesIndexTo);
  }
  return indexName;
};

export const getDimensionId = (ctx: Context, type: Type, index: number) => {
  let source = type.indexedBy;
  if (source) {
    source = resolveIndexDelegation(ctx, source);
  }
  return source ?? index;
};

export function groupTypesByDimension(
  ctx: Context,
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
