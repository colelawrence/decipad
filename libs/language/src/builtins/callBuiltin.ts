import { builtins } from './builtins';
import { automapValues, automapValuesForReducer } from '../dimtools';

import { Value, AnyValue, Column, fromJS } from '../interpreter/Value';
import { getDefined, getInstanceof } from '../utils';
import type { Type } from '../type';
import { autoconvertResult, autoconvertArguments } from '../units';
import { BuiltinSpec } from './interfaces';

function requireNonNull<T>(thing: T): T {
  if (thing == null) {
    throw new TypeError('null value detected');
  }
  return thing;
}

function callBuiltinAfterAutoconvert(
  funcName: string,
  builtin: BuiltinSpec,
  args: Value[],
  argTypes: Type[]
): Value {
  if (builtin.fnValuesNoAutomap) {
    return builtin.fnValuesNoAutomap(args);
  }

  const lowerDimFn = (argsLowerDims: Value[]) => {
    if (builtin.fn != null) {
      const argData = argsLowerDims.map((a) => a.getData()).map(requireNonNull);
      try {
        return fromJS(builtin.fn(...argData));
      } catch (err) {
        console.error(err);
        throw new TypeError(
          `Error calling builtin ${funcName}: ${(err as Error).message}`
        );
      }
    } else if (builtin.fnValues != null) {
      return builtin.fnValues(...(argsLowerDims as AnyValue[]));
    } else {
      /* istanbul ignore next */
      throw new Error('unreachable');
    }
  };

  if (builtin.isReducer) {
    return automapValuesForReducer(
      argTypes[0],
      getInstanceof(args[0], Column),
      lowerDimFn
    );
  }

  return automapValues(argTypes, args, lowerDimFn, builtin.argCardinalities);
}

export function callBuiltin(
  funcName: string,
  argsBeforeConvert: Value[],
  argTypes: Type[],
  returnType: Type
): Value {
  const builtin = getDefined(
    builtins[funcName],
    `panic: builtin not found: ${funcName}`
  );

  if (builtin.aliasFor) {
    return callBuiltin(
      builtin.aliasFor,
      argsBeforeConvert,
      argTypes,
      returnType
    );
  }

  if (builtin.noAutoconvert) {
    return callBuiltinAfterAutoconvert(
      funcName,
      builtin,
      argsBeforeConvert,
      argTypes
    );
  }
  const args = autoconvertArguments(argsBeforeConvert, argTypes);
  return autoconvertResult(
    callBuiltinAfterAutoconvert(funcName, builtin, args, argTypes),
    returnType
  );
}
