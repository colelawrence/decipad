import { builtins } from '../builtins';
import { automapValues } from '../dimtools';

import { Value, AnyValue, fromJS } from './Value';

export function callBuiltin(funcName: string, args: Value[]) {
  const builtin = builtins[funcName];

  return automapValues(
    args,
    (argsLowerDims) => {
      if (builtin.fn != null) {
        const argData = argsLowerDims.map((a) => a.getData());
        return fromJS(builtin.fn(...argData));
      } else if (builtin.fnValues != null) {
        return builtin.fnValues(...(argsLowerDims as AnyValue[]));
      } else {
        throw new Error(
          'panic: bad builtin ' +
            funcName +
            ' did not have either fn or fnValues'
        );
      }
    },
    builtin.argCardinalities
  );
}
