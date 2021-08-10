import { Type, build as t } from '../type';
import { automapTypes } from '../dimtools';
import { builtins } from './builtins';

export const callBuiltinFunctor = (
  builtinName: string,
  ...givenArguments: Type[]
) => {
  const builtin = builtins[builtinName];

  if (builtin == null) {
    return t.impossible(`The function ${builtinName} does not exist`);
  } else {
    if (givenArguments.length !== builtin.argCount) {
      return t.impossible(
        `The function ${builtinName} requires ${builtin.argCount} parameters and ${givenArguments.length} parameters were entered`
      );
    }

    return automapTypes(
      givenArguments,
      (types) =>
        Type.combine(...types).mapType(() => builtin.functor(...types)),
      builtin.argCardinalities
    );
  }
};
