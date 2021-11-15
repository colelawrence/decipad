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
          acc * convertFromBaseUnitIfKnown(1, unit.unit) ** unit.exp,
        value.getData() as number
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
        (acc, unit) => acc * convertToBaseUnitIfKnown(1, unit.unit) ** unit.exp,
        value.getData() as number
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
