import { getDefined } from '@decipad/utils';
import type { PromiseOrType } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import {
  InferError,
  Type,
  Value,
  buildType as t,
} from '@decipad/language-types';
import { FullBuiltinSpec, Functor } from './interfaces';
import { parseFunctor } from './parseFunctor';
import { BuiltinContextUtils } from './types';

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
      fnValues: (
        values: Value.Value[],
        types: Type[],
        utils: BuiltinContextUtils
      ) => PromiseOrType<Value.Value>;
      functor: Functor;
      functionSignature?: undefined;
    }
  | {
      argTypes: OverloadTypeName[];
      fnValues: (
        values: Value.Value[],
        types: Type[],
        utils: BuiltinContextUtils
      ) => PromiseOrType<Value.Value>;
      functor?: undefined;
      functionSignature: string;
    };

export const overloadBuiltin = (
  fName: string,
  argCount: number | number[],
  overloads: OverloadedBuiltinSpec[],
  operatorKind?: 'prefix' | 'infix'
): FullBuiltinSpec => {
  const byArgTypes = new Map(
    overloads.map((o) => [argTypesKey(o.argTypes), o])
  );

  const getArgTypeKey = (types: Type[]): string =>
    argTypesKey(types.map(getOverloadedTypeFromType));

  const getOverload = (types: Type[]): OverloadedBuiltinSpec | undefined =>
    byArgTypes.get(getArgTypeKey(types));

  const fnValues = async (
    values: Value.Value[],
    types: Type[],
    utils: BuiltinContextUtils
  ): Promise<Value.Value> => {
    if (values.find(Value.isUnknownValue)) {
      return Value.UnknownValue;
    }
    const overload = getOverload(getDefined(types));
    if (!overload) {
      throw new Error(
        `panic: could not find overload for ${fName}(${getArgTypeKey(
          getDefined(types)
        )})`
      );
    }
    return overload.fnValues(values, types, utils);
  };

  const functor: Functor = async (types, values, context): Promise<Type> => {
    const argTypeNames = types.map(getOverloadedTypeFromType);
    const overload = byArgTypes.get(argTypesKey(argTypeNames));

    if (overload == null) {
      return t.impossible(InferError.badOverloadedBuiltinCall(fName, types));
    } else {
      const resolvedFunctor =
        overload.functor ?? parseFunctor(overload.functionSignature);
      return resolvedFunctor(types, values, context);
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
  val: Value.Value
): OverloadTypeName | null => {
  if (val instanceof Value.StringValue) {
    return 'string';
  } else if (val instanceof Value.BooleanValue) {
    return 'boolean';
  } else if (val instanceof Value.NumberValue) {
    return 'number';
  } else if (val instanceof Value.DateValue) {
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
