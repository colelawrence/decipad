// eslint-disable-next-line no-restricted-imports
import { Type, buildType as t } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { singular } from '@decipad/language-utils';
import { columnToTable } from './columnToTable';
import { Realm } from '../interpreter';

const normalizeTarget = (target: string) => singular(target.toLowerCase());

export const coerceType = async (
  realm: Realm,
  source: Type,
  _target: string
): Promise<Type> => {
  const target = normalizeTarget(_target);
  if ((await source.isColumn()) && target === 'table') {
    return columnToTable.type(realm, source);
  }
  return t.impossible(`Don't know how to convert to ${target}`);
};
