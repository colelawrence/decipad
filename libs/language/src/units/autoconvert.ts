import Fraction from 'fraction.js';
import { Type } from '..';
import { Value } from '../interpreter';
import { fromJS } from '../interpreter/Value';
import {
  convertFromBaseUnitIfKnown,
  convertToBaseUnitIfKnown,
} from './convert';
import { zip } from '../utils';

export function autoconvertResult(value: Value, type: Type): Value {
  if (type.type === 'number') {
    const units = (type.unit && type.unit.args) || [];
    return fromJS(
      units.reduce(
        (acc, unit) =>
          acc.mul(
            convertFromBaseUnitIfKnown(new Fraction(1), unit.unit).pow(unit.exp)
          ),
        value.getData() as Fraction
      )
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
          acc.mul(
            convertToBaseUnitIfKnown(new Fraction(1), unit.unit).pow(unit.exp)
          ),
        value.getData() as Fraction
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
