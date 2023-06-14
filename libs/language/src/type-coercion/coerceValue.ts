import { singular } from 'pluralize';
import { Type } from '../type/Type';
import { columnToTable } from './columnToTable';
import { RuntimeError, Value } from '../value';
import { Realm } from '../interpreter';

const normalizeTarget = (target: string) => singular(target.toLowerCase());

export const coerceValue = async (
  realm: Realm,
  sourceType: Type,
  sourceValue: Value,
  _target: string
): Promise<Value> => {
  const target = normalizeTarget(_target);
  if ((await sourceType.isColumn()) && target === 'table') {
    return columnToTable.value(realm, sourceType, sourceValue);
  }
  throw new RuntimeError(`Don't know how to convert to ${target}`);
};
