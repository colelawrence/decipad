// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { serializeType, buildType as t } from '@decipad/language-types';
import { singular } from '@decipad/language-units';
import { columnToTable } from './columnToTable';
import { treeToTable } from './treeToTable';
import type { TRealm } from '../scopedRealm';

const normalizeTarget = (target: string) => singular(target.toLowerCase());

export const coerceType = async (
  realm: TRealm,
  source: Type,
  _target: string
): Promise<Type> => {
  const target = normalizeTarget(_target);
  if (target === 'table') {
    if (!(await source.isTable()).errorCause) {
      return source;
    }
    if (!(await source.isColumn()).errorCause) {
      return columnToTable.type(realm, source);
    }
    if (!(await source.isTree()).errorCause) {
      return treeToTable.type(realm, source);
    }
  }
  const sourceSerType = serializeType(source);
  return t.impossible(
    `Don't know how to convert ${sourceSerType.kind} to ${target}`
  );
};
