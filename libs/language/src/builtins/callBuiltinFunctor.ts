import { Type, build as t } from '../type';
import { automapTypes } from '../dimtools';
import { getDefined } from '../utils';
import { builtins } from './builtins';

export const callBuiltinFunctor = (
  builtinName: string,
  ...givenArguments: Type[]
): Type => {
  const builtin = builtins[builtinName];

  if (builtin == null) {
    return t.impossible(`The function ${builtinName} does not exist`);
  } else {
    if (builtin.aliasFor) {
      return callBuiltinFunctor(builtin.aliasFor, ...givenArguments);
    }
    if (givenArguments.length !== builtin.argCount) {
      return t.impossible(
        `The function ${builtinName} requires ${builtin.argCount} parameters and ${givenArguments.length} parameters were entered`
      );
    }

    if (builtin.functorNoAutomap) {
      return builtin.functorNoAutomap(...givenArguments);
    }

    return automapTypes(
      givenArguments,
      (types) =>
        Type.combine(...types).mapType(() =>
          getDefined(builtin.functor, 'need a builtin functor')(...types)
        ),
      builtin.argCardinalities
    );
  }
};
