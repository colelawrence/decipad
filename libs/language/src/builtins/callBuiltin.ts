import { getOperatorByName } from './operators';
import { automapValues, automapValuesForReducer } from '../dimtools';

import { Value, AnyValue, Column, fromJS } from '../interpreter/Value';
import { getDefined, getInstanceof } from '../utils';
import { RuntimeError } from '../interpreter';
import type { Type } from '../type';
import { autoconvertResult, autoconvertArguments } from '../units';
import { BuiltinSpec } from './interfaces';

function shouldAutoconvert(types: Type[]): boolean {
  if (types.length === 2) {
    const [typeA, typeB] = types.map((t) => t.reducedToLowest());
    if ((typeA.unit && !typeB.unit) || (typeB.unit && !typeA.unit)) {
      return false;
    }
  }
  return true;
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

  const lowerDimFn = (argsLowerDims: Value[], typesLowerDims: Type[]) => {
    if (builtin.fn != null) {
      const argData = argsLowerDims.map((a) => getDefined(a.getData()));
      try {
        return fromJS(builtin.fn(...argData));
      } catch (err) {
        if (err instanceof RuntimeError) {
          throw err;
        }
        console.error(err);
        throw new TypeError(
          `Error calling builtin ${funcName}: ${(err as Error).message}`
        );
      }
    } else if (builtin.fnValues != null) {
      return builtin.fnValues(argsLowerDims as AnyValue[], typesLowerDims);
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
