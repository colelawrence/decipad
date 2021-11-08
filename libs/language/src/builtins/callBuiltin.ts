import { builtins } from './builtins';
import { automapValues } from '../dimtools';

import { Value, AnyValue, fromJS } from '../interpreter/Value';
import { getDefined } from '../utils';
import type { Type } from '../type';

export function callBuiltin(
  funcName: string,
  args: Value[],
  argTypes: Type[]
): Value {
  const builtin = getDefined(
    builtins[funcName],
    `panic: builtin not found: ${funcName}`
  );

  if (builtin.aliasFor) {
    return callBuiltin(builtin.aliasFor, args, argTypes);
  }

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
