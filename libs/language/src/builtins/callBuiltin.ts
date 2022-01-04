import { getOperatorByName } from './operators';
import { automapValues, automapValuesForReducer } from '../dimtools';

import { Value, AnyValue, Column, fromJS } from '../interpreter/Value';
import { getDefined, getInstanceof } from '../utils';
import type { Type } from '../type';
import { autoconvertResult, autoconvertArguments } from '../units';
import { BuiltinSpec } from './interfaces';

function shouldAutoconvert(types: Type[]): boolean {
  if (types.length === 2) {
    const [typeA, typeB] = types;
    if ((typeA.unit && !typeB.unit) || (typeB.unit && !typeA.unit)) {
      return false;
    }
  }
  return true;
}

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
    return builtin.fnValuesNoAutomap(args, argTypes);
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
      return builtin.fnValues(argsLowerDims as AnyValue[], argTypes);
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
  const op = getDefined(
    getOperatorByName(funcName),
    `panic: builtin not found: ${funcName}`
  );

  if (op.aliasFor) {
    return callBuiltin(op.aliasFor, argsBeforeConvert, argTypes, returnType);
  }

  const autoConvert = !op.noAutoconvert && shouldAutoconvert(argTypes);
  const args = autoConvert
    ? autoconvertArguments(argsBeforeConvert, argTypes)
    : argsBeforeConvert;

  const resultBeforeConvertingBack = callBuiltinAfterAutoconvert(
    funcName,
    op,
    args,
    argTypes
  );

  const result = autoConvert
    ? autoconvertResult(resultBeforeConvertingBack, returnType)
    : resultBeforeConvertingBack;

  return result;
}
