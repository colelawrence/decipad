import { BuiltinSpec } from './interfaces';
import { InferError, Type, build as t } from '../type';
import {
  Value,
  DateValue,
  Range,
  StringValue,
  BooleanValue,
  NumberValue,
} from '../value';
import { getDefined } from '../utils';
import { AST } from '..';
import { parseFunctor } from './parseFunctor';

export type OverloadTypeName =
  | 'number'
  | 'string'
  | 'boolean'
  | 'unit'
  | 'date'
  | 'range';

export type OverloadedBuiltinSpec =
  | {
      argTypes: OverloadTypeName[];
      fnValues: (values: Value[], types?: Type[]) => Value;
      functor: (types: Type[], values?: AST.Expression[]) => Type;
      functionSignature?: undefined;
    }
  | {
      argTypes: OverloadTypeName[];
      fnValues: (values: Value[], types?: Type[]) => Value;
      functor?: undefined;
      functionSignature: string;
    };

export const overloadBuiltin = (
  fName: string,
  argCount: number | number[],
  overloads: OverloadedBuiltinSpec[],
  operatorKind?: 'prefix' | 'infix'
): BuiltinSpec => {
  const byArgTypes = new Map(
    overloads.map((o) => [argTypesKey(o.argTypes), o])
  );

  function getOverload(values: Value[]): OverloadedBuiltinSpec {
    const argTypeNames = values.map(getOverloadedTypeFromValue);
    return getDefined(
      byArgTypes.get(argTypesKey(argTypeNames)),
      `panic: did not find version of function ${fName} for arg types ${argTypeNames.join(
        ', '
      )}`
    );
  }

  const fnValues = (values: Value[], types?: Type[]) => {
    return getOverload(values).fnValues(values, types);
  };

  const functor = (types: Type[]) => {
    const argTypeNames = types.map(getOverloadedTypeFromType);
    const overload = byArgTypes.get(argTypesKey(argTypeNames));

    if (overload == null) {
      return t.impossible(InferError.badOverloadedBuiltinCall(fName, types));
    } else {
      const resolvedFunctor =
        overload.functor ?? parseFunctor(overload.functionSignature);
      return resolvedFunctor(types);
    }
  };

  return {
    argCount,
    fnValues,
    functor,
    operatorKind,
  };
};

// for string Maps
const argTypesKey = (types: (OverloadTypeName | null)[]) => types.join(';');

export const getOverloadedTypeFromValue = (
  val: Value
): OverloadTypeName | null => {
  if (val instanceof StringValue) {
    return 'string';
  } else if (val instanceof BooleanValue) {
    return 'boolean';
  } else if (val instanceof NumberValue) {
    return 'number';
  } else if (val instanceof DateValue) {
    return 'date';
  } else if (val instanceof Range) {
    return 'range';
  } else {
    return null;
  }
};

export const getOverloadedTypeFromType = (t: Type): OverloadTypeName | null => {
  if (t.type != null) {
    return t.type;
  } else if (t.date != null) {
    return 'date';
  } else if (t.rangeOf) {
    return 'range';
  } else {
    return null;
  }
};
