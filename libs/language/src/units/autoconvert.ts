import { getDefined } from '@decipad/utils';
import type { Realm, Type } from '..';
import { NumberValue, Value } from '../value';
import { expandUnits, contractUnits } from './expand';
import { zip } from '../utils';
import { automapValues } from '../dimtools';

async function autoconvertArgument(
  realm: Realm,
  value: Value,
  type: Type
): Promise<Value> {
  const typeLowestDims = await type.reducedToLowest();
  if (typeLowestDims.unit) {
    const [, expander] = expandUnits(getDefined(typeLowestDims.unit));
    return automapValues(realm.inferContext, [type], [value], ([value]) => {
      if (value instanceof NumberValue) {
        return NumberValue.fromValue(expander(value.value));
      }
      return value;
    });
  }
  return Promise.resolve(value);
}

export async function autoconvertResult(
  realm: Realm,
  value: Value,
  type: Type
): Promise<Value> {
  const typeLowestDims = await type.reducedToLowest();
  if (typeLowestDims.unit) {
    const [, contractor] = contractUnits(getDefined(typeLowestDims.unit));
    return automapValues(realm.inferContext, [type], [value], ([value]) => {
      if (value instanceof NumberValue) {
        return NumberValue.fromValue(contractor(value.value));
      }
      return value;
    });
  }
  return Promise.resolve(value);
}

export async function autoconvertArguments(
  realm: Realm,
  values: Value[],
  types: Type[]
): Promise<Value[]> {
  return Promise.all(
    zip(values, types).map(async ([value, type]) =>
      autoconvertArgument(realm, value, type)
    )
  );
}
