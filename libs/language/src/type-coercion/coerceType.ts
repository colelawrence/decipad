import { singular } from 'pluralize';
import { buildType } from '../type';
import { Type } from '../type/Type';
import { columnToTable } from './columnToTable';
import { Context } from '../infer';

const normalizeTarget = (target: string) => singular(target.toLowerCase());

export const coerceType = async (
  ctx: Context,
  source: Type,
  _target: string
): Promise<Type> => {
  const target = normalizeTarget(_target);
  if ((await source.isColumn()) && target === 'table') {
    return columnToTable.type(ctx, source);
  }
  return buildType.impossible(`Don't know how to convert to ${target}`);
};
