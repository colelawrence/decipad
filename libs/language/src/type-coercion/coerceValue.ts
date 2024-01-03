// eslint-disable-next-line no-restricted-imports
import { Type, Value, RuntimeError } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { singular } from '@decipad/language-utils';
import { columnToTable } from './columnToTable';
import { Realm } from '../interpreter';

const normalizeTarget = (target: string) => singular(target.toLowerCase());

export const coerceValue = async (
  realm: Realm,
  sourceType: Type,
  sourceValue: Value.Value,
  _target: string
): Promise<Value.Value> => {
  const target = normalizeTarget(_target);
  if ((await sourceType.isColumn()) && target === 'table') {
    return columnToTable.value(realm, sourceType, sourceValue);
  }
  throw new RuntimeError(`Don't know how to convert to ${target}`);
};
