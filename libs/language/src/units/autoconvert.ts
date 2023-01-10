import { getDefined } from '@decipad/utils';
import type { Type } from '..';
import { NumberValue, Value } from '../value';
import { expandUnits, contractUnits } from './expand';
import { zip } from '../utils';
import { automapValues } from '../dimtools';

function autoconvertArgument(value: Value, type: Type): Value {
  const typeLowestDims = type.reducedToLowest();
  if (typeLowestDims.unit) {
    const [, expander] = expandUnits(getDefined(typeLowestDims.unit));
    return automapValues([type], [value], ([value]) => {
      if (value instanceof NumberValue) {
        return NumberValue.fromValue(expander(value.value));
      }
      return value;
    });
  }
  return value;
}

export function autoconvertResult(value: Value, type: Type): Value {
  const typeLowestDims = type.reducedToLowest();
  if (typeLowestDims.unit) {
    const [, contractor] = contractUnits(getDefined(typeLowestDims.unit));
    return automapValues([type], [value], ([value]) => {
      if (value instanceof NumberValue) {
        return NumberValue.fromValue(contractor(value.value));
      }
      return value;
    });
  }
  return value;
}

export function autoconvertArguments(values: Value[], types: Type[]): Value[] {
  return zip(values, types).map(([value, type]) =>
    autoconvertArgument(value, type)
  );
}
