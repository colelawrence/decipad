// eslint-disable-next-line no-restricted-imports
import type { Type, Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { RuntimeError } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { singular } from '@decipad/language-utils';
import { columnToTable } from './columnToTable';
import { treeToTable } from './treeToTable';
import type { TRealm } from '../scopedRealm';

const normalizeTarget = (target: string) => singular(target.toLowerCase());

export const coerceValue = async (
  realm: TRealm,
  sourceType: Type,
  sourceValue: Value.Value,
  _target: string
): Promise<Value.Value> => {
  const target = normalizeTarget(_target);
  if (target === 'table') {
    if (!(await sourceType.isColumn()).errorCause) {
      return columnToTable.value(realm, sourceType, sourceValue);
    }
    if (!(await sourceType.isTree()).errorCause) {
      return treeToTable.value(realm, sourceType, sourceValue);
    }
    if (!(await sourceType.isTable()).errorCause) {
      return sourceValue;
    }
    throw new RuntimeError(
      `Don't know how to convert non-column or non-tree value to ${target}`
    );
  }
  throw new RuntimeError(`Don't know how to convert value to ${target}`);
};
