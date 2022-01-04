import Fraction from '@decipad/fraction';
import { getDefined } from '@decipad/utils';
import { Type, Units } from '..';
import { Value } from '../interpreter';
import { fromJS } from '../interpreter/Value';
import { toExpandedBaseQuantity, fromExpandedBaseQuantity } from './convert';
import { zip } from '../utils';
import { automapValues } from '../dimtools';

function convertToNoMultipliers(n: Fraction, units: Units | null): Fraction {
  return (units?.args ?? []).reduce(
    (n, { multiplier, exp }) =>
      n.mul(new Fraction(multiplier).pow(new Fraction(exp))),
    n
  );
}

function convertFromNoMultipliers(n: Fraction, units: Units | null): Fraction {
  return (units?.args ?? []).reduce(
    (n, { multiplier, exp }) =>
      n.div(new Fraction(multiplier).pow(new Fraction(exp))),
    n
  );
}

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
        const convertedToNoMultipliers = convertToNoMultipliers(
          convertedValue,
          typeLowestDims.unit
        );
        return fromJS(convertedToNoMultipliers);
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
        const convertedFromNoMultipliers = convertFromNoMultipliers(
          reconvertedValue,
          typeLowestDims.unit
        );
        return fromJS(convertedFromNoMultipliers);
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
