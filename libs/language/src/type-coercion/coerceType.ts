// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  buildType as t,
  Dimension,
  serializeType,
} from '@decipad/language-types';
import { singular } from '@decipad/language-units';
import { columnToTable } from './columnToTable';
import { treeToTable } from './treeToTable';
import type { TRealm } from '../scopedRealm';
import { metricToTable } from './metricToTable';

const normalizeTarget = (target: string) => singular(target.toLowerCase());

export const coerceType = async (
  realm: TRealm,
  source: Type,
  _target: string
): Promise<Type> => {
  const target = normalizeTarget(_target);
  if (target === 'table') {
    if (!(await source.isTable()).errorCause) {
      return source.mapType((table) => {
        table.rowCount = undefined;
        table.cellCount = undefined;
        return table;
      });
    }
    if (!(await source.isColumn()).errorCause) {
      return columnToTable.type(realm, source);
    }
    if (!(await source.isTree()).errorCause) {
      return treeToTable.type(realm, source);
    }
    if (!(await source.isMetric()).errorCause) {
      return metricToTable.type(realm, source);
    }
  }
  const sourceSerType = serializeType(source);
  if (target === 'number') {
    return Dimension.automapTypes(
      realm.utils,
      [source],
      async ([expressionType]: Type[]): Promise<Type> => {
        if (!(await expressionType.isScalar('string')).errorCause) {
          return t.number();
        }
        return t.impossible(
          `Don't know how to convert ${sourceSerType.kind} to ${target}`
        );
      }
    );
  }
  if (target === 'string') {
    return Dimension.automapTypes(
      realm.utils,
      [source],
      async ([expressionType]: Type[]): Promise<Type> => {
        if (!(await expressionType.isScalar('number')).errorCause) {
          return t.string();
        }
        return t.impossible(
          `Don't know how to convert ${sourceSerType.kind} to ${target}`
        );
      }
    );
  }
  return t.impossible(
    `Don't know how to convert ${sourceSerType.kind} to ${target}`
  );
};
