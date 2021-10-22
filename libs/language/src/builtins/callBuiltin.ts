import { builtins } from './builtins';
import { automapValues } from '../dimtools';

import { Value, AnyValue, fromJS } from '../interpreter/Value';
import { getDefined } from '../utils';
import type { Type } from '..';

export function callBuiltin(funcName: string, args: Value[], argTypes: Type[]) {
  const builtin = getDefined(
    builtins[funcName],
    `panic: builtin not found: ${funcName}`
  );

  return automapValues(
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
    builtin.argCardinalities,
    argTypes.map((arg) => arg.indexedBy)
  );
}
