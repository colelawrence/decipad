import Fraction from '@decipad/fraction';
import { getDefined } from '@decipad/utils';
import { Type } from '..';
import { Value } from '../interpreter';
import { fromJS } from '../interpreter/Value';
import { toExpandedBaseQuantity, fromExpandedBaseQuantity } from './convert';
import { zip } from '../utils';
import { automapValues } from '../dimtools';

function autoconvertArgument(value: Value, type: Type): Value {
  const typeLowestDims = type.reducedToLowest();
  if (typeLowestDims.unit) {
    return automapValues([type], [value], ([value]) => {
      const data = value.getData();
      if (data instanceof Fraction) {
        const [, convertedValue] = toExpandedBaseQuantity(
          data,
          getDefined(typeLowestDims.unit)
        );
        return fromJS(convertedValue);
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
      const data = value.getData();
      if (data instanceof Fraction) {
        const n = data;
        const [, reconvertedValue] = fromExpandedBaseQuantity(
          n,
          getDefined(typeLowestDims.unit)
        );
        return fromJS(reconvertedValue);
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
