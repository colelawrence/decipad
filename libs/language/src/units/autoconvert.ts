import { getDefined } from '@decipad/utils';
import type { Type } from '..';
import { FractionValue, Value } from '../value';
import { toExpandedBaseQuantity, fromExpandedBaseQuantity } from './convert';
import { zip } from '../utils';
import { automapValues } from '../dimtools';

function autoconvertArgument(value: Value, type: Type): Value {
  const typeLowestDims = type.reducedToLowest();
  if (typeLowestDims.unit) {
    return automapValues([type], [value], ([value]) => {
      if (value instanceof FractionValue) {
        const [, convertedValue] = toExpandedBaseQuantity(
          value.value,
          getDefined(typeLowestDims.unit)
        );
        return FractionValue.fromValue(convertedValue);
      }
      return value;
    });
  }
  return value;
}

export function autoconvertResult(value: Value, type: Type): Value {
  const typeLowestDims = type.reducedToLowest();
  if (typeLowestDims.unit) {
    return automapValues([type], [value], ([value]) => {
      if (value instanceof FractionValue) {
        const [, reconvertedValue] = fromExpandedBaseQuantity(
          value.value,
          getDefined(typeLowestDims.unit)
        );
        return FractionValue.fromValue(reconvertedValue);
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
