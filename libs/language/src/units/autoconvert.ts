import Fraction from 'fraction.js';
import { Type } from '..';
import { Value } from '../interpreter';
import { fromJS } from '../interpreter/Value';
import {
  convertFromBaseUnitIfKnown,
  convertToBaseUnitIfKnown,
} from './convert';
import { zip, getInstanceof } from '../utils';

export function autoconvertResult(value: Value, type: Type): Value {
  if (type.type === 'number') {
    const units = (type.unit && type.unit.args) || [];
    return fromJS(
      units.reduce((acc, unit) => {
        return convertFromBaseUnitIfKnown(
          acc.div(unit.multiplier),
          unit.unit,
          unit.exp || 1
        );
      }, getInstanceof(value.getData(), Fraction))
    );
  }
  return value;
}

function autoconvertArgument(value: Value, type: Type): Value {
  if (type.type === 'number') {
    const units = (type.unit && type.unit.args) || [];
    return fromJS(
      units.reduce(
        (acc, unit) =>
          convertToBaseUnitIfKnown(
            acc.mul(unit.multiplier ** unit.exp),
            unit.unit,
            unit.exp || 1
          ),
        getInstanceof(value.getData(), Fraction)
      )
    );
  }
  return value;
}

export function autoconvertArguments(values: Value[], types: Type[]): Value[] {
  return zip(values, types).map(([value, type]) =>
    autoconvertArgument(value, type)
  );
}
