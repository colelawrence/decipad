import Fraction from 'fraction.js';
import { Units } from '../parser/ast-types';
import { Type } from '..';
import { Value } from '../interpreter';
import { fromJS } from '../interpreter/Value';
import { toExpandedBaseQuantity, fromExpandedBaseQuantity } from './convert';
import { zip, getInstanceof } from '../utils';

function convertToNoMultipliers(n: Fraction, units: Units | null): Fraction {
  return (units?.args ?? []).reduce(
    (n, { multiplier, exp }) => n.mul(multiplier ** exp),
    n
  );
}

function convertFromNoMultipliers(n: Fraction, units: Units | null): Fraction {
  return (units?.args ?? []).reduce(
    (n, { multiplier, exp }) => n.div(multiplier ** exp),
    n
  );
}

function autoconvertArgument(value: Value, type: Type): Value {
  if (type.unit) {
    const n = getInstanceof(value.getData(), Fraction);
    const [, convertedValue] = toExpandedBaseQuantity(n, type.unit);
    const convertedToNoMultipliers = convertToNoMultipliers(
      convertedValue,
      type.unit
    );
    return fromJS(convertedToNoMultipliers);
  }
  return value;
}

export function autoconvertResult(value: Value, type: Type): Value {
  if (type.unit) {
    const n = getInstanceof(value.getData(), Fraction);
    const [, reconvertedValue] = fromExpandedBaseQuantity(n, type.unit);
    const convertedFromNoMultipliers = convertFromNoMultipliers(
      reconvertedValue,
      type.unit
    );
    return fromJS(convertedFromNoMultipliers);
  }
  return value;
}

export function autoconvertArguments(values: Value[], types: Type[]): Value[] {
  return zip(values, types).map(([value, type]) =>
    autoconvertArgument(value, type)
  );
}
