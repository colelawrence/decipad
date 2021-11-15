import { builtins } from './builtins';
import { automapValues } from '../dimtools';

import { Value, AnyValue, fromJS } from '../interpreter/Value';
import { getDefined } from '../utils';
import type { Type } from '../type';
import { autoconvertResult, autoconvertArguments } from '../units';
import { BuiltinSpec } from './interfaces';

function callBuiltinAfterAutoconvert(
  builtin: BuiltinSpec,
  args: Value[],
  argTypes: Type[]
): Value {
  if (builtin.fnValuesNoAutomap) {
    return builtin.fnValuesNoAutomap(args);
  }

  return automapValues(
    argTypes,
    args,
    (argsLowerDims) => {
      if (builtin.fn != null) {
        const argData = argsLowerDims.map((a) => a.getData());
        return fromJS(builtin.fn(...argData));
      } else if (builtin.fnValues != null) {
        return builtin.fnValues(...(argsLowerDims as AnyValue[]));
      } else {
        /* istanbul ignore next */
        throw new Error('unreachable');
      }
    },
    builtin.argCardinalities
  );
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
    return callBuiltinAfterAutoconvert(builtin, argsBeforeConvert, argTypes);
  }
  const args = autoconvertArguments(argsBeforeConvert, argTypes);
  return autoconvertResult(
    callBuiltinAfterAutoconvert(builtin, args, argTypes),
    returnType
  );
}
