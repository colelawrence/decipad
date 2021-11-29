import Fraction from 'fraction.js';
import { Type } from '..';
import { Value } from '../interpreter';
import { fromJS } from '../interpreter/Value';
import {
  convertFromBaseUnitIfKnown,
  convertToBaseUnitIfKnown,
} from './convert';
import { zip, getInstanceof } from '../utils';
import { expandUnits } from './expand';

export function autoconvertResult(value: Value, type: Type): Value {
  if (type.type === 'number') {
    const units = type.unit?.args ?? [];
    const [expandedUnits, convert] = expandUnits(units);
    const n = getInstanceof(value.getData(), Fraction);
    const contractedN = n.div(convert(new Fraction(1)));
    return fromJS(
      (expandedUnits ?? []).reduce((acc, unit) => {
        return convertFromBaseUnitIfKnown(
          acc.div(unit.multiplier ** unit.exp),
          unit.unit,
          unit.exp || 1
        );
      }, contractedN)
    );
  }
  return value;
}

function autoconvertArgument(value: Value, type: Type): Value {
  if (type.type === 'number') {
    const units = (type.unit && type.unit.args) || [];
    const n = getInstanceof(value.getData(), Fraction);
    const [expandedUnits, convert] = expandUnits(units);
    const expandedN = convert(n);
    const result = (expandedUnits || []).reduce(
      (acc, unit) =>
        convertToBaseUnitIfKnown(
          acc.mul(unit.multiplier ** unit.exp),
          unit.unit,
          unit.exp
        ),
      expandedN
    );
    return fromJS(result);
  }
  return value;
}

export function autoconvertArguments(values: Value[], types: Type[]): Value[] {
  return zip(values, types).map(([value, type]) =>
    autoconvertArgument(value, type)
  );
}
