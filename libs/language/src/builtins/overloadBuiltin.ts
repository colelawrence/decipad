import { BuiltinSpec } from './interfaces';
import { InferError, Type, build as t } from '../type';
import {
  AnyValue,
  Date,
  Scalar,
  TimeQuantity,
  Range,
} from '../interpreter/Value';
import { getDefined } from '../utils';
import { AST } from '..';

export type OverloadTypeName =
  | 'number'
  | 'string'
  | 'boolean'
  | 'unit'
  | 'date'
  | 'time-quantity';

export interface OverloadedBuiltinSpec {
  argTypes: OverloadTypeName[];
  fnValues: (...args: AnyValue[]) => AnyValue;
  functor: (types: Type[], values?: AST.Expression[]) => Type;
}

export const overloadBuiltin = (
  fName: string,
  argCount: number,
  overloads: OverloadedBuiltinSpec[]
): BuiltinSpec => {
  const byArgTypes = new Map(
    overloads.map((o) => [argTypesKey(o.argTypes), o])
  );
  const fnValues = (...values: AnyValue[]) => {
    const argTypeNames = values.map(getOverloadedTypeFromValue);
    const overload: OverloadedBuiltinSpec = getDefined(
      byArgTypes.get(argTypesKey(argTypeNames)),
      `panic: did not find version of function ${fName} for arg types ${argTypeNames.join(
        ', '
      )}`
    );
    return overload.fnValues(...values);
  };

  const functor = (types: Type[]) => {
    const argTypeNames = types.map(getOverloadedTypeFromType);
    const overload = byArgTypes.get(argTypesKey(argTypeNames));

    if (overload == null) {
      return t.impossible(
        InferError.badOverloadedBuiltinCall(fName, argTypeNames)
      );
    } else {
      return overload.functor(types);
    }
  };

  return {
    argCount,
    fnValues,
    functor,
  };
};

// for string Maps
const argTypesKey = (types: OverloadTypeName[]) => types.join(';');

export const getOverloadedTypeFromValue = (val: AnyValue): OverloadTypeName => {
  if (val instanceof Scalar) {
    return typeof val.value as 'number' | 'string' | 'boolean';
  } else if (val instanceof Date) {
    return 'date';
  } else if (val instanceof TimeQuantity) {
    return 'time-quantity';
  } else if (val instanceof Range) {
    return 'number';
  } else {
    throw new Error('Could not call overloaded function');
  }
};

export const getOverloadedTypeFromType = (t: Type): OverloadTypeName => {
  if (t.type != null) {
    return t.type as 'number' | 'string' | 'boolean';
  } else if (t.date != null) {
    return 'date';
  } else if (t.timeUnits != null) {
    return 'time-quantity';
  } else if (t.rangeOf?.type) {
    return t.rangeOf.type as 'number' | 'string' | 'boolean';
  } else {
    throw new Error('Could not call overloaded function');
  }
};
