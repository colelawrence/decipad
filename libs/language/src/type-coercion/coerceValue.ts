import type { Type, Value } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import {
  Dimension,
  RuntimeError,
  Value as ValueTypes,
} from '@decipad/language-types';
import { singular } from '@decipad/language-units';
import { columnToTable } from './columnToTable';
import { treeToTable } from './treeToTable';
import type { TRealm } from '../scopedRealm';
import { isDeciNumberInput, N } from '@decipad/number';

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
  if (target === 'number') {
    return Dimension.automapValues(
      realm.utils,
      [sourceType],
      [sourceValue],
      async ([val], [type]) => {
        const stringType = await type.isScalar('string');
        if (stringType.errorCause) {
          return val;
        }
        const number = await val.getData();
        if (typeof number === 'string') {
          return new ValueTypes.NumberValue(N(number));
        }
        throw new RuntimeError(
          `Don't know how to convert ${typeof val} value to ${target}`
        );
      }
    );
  }
  if (target === 'string') {
    return Dimension.automapValues(
      realm.utils,
      [sourceType],
      [sourceValue],
      async ([val]) => {
        const n = await val.getData();
        if (isDeciNumberInput(n)) {
          return new ValueTypes.StringValue(n.toString());
        }
        throw new RuntimeError(
          `Don't know how to convert ${typeof val} value to ${target}`
        );
      }
    );
  }
  throw new RuntimeError(`Don't know how to convert value to ${target}`);
};
