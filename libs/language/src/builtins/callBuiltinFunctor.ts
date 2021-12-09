import { Type, build as t } from '../type';
import { automapTypes, automapTypesForReducer } from '../dimtools';
import { getDefined } from '../utils';
import { builtins } from './builtins';
import { AST } from '../parser';

export const callBuiltinFunctor = (
  builtinName: string,
  givenArguments: Type[],
  givenValues?: AST.Expression[]
): Type => {
  const builtin = builtins[builtinName];

  if (builtin == null) {
    return t.impossible(`The function ${builtinName} does not exist`);
  } else {
    if (builtin.aliasFor) {
      return callBuiltinFunctor(builtin.aliasFor, givenArguments, givenValues);
    }

    if (givenArguments.length !== builtin.argCount) {
      return t.impossible(
        `The function ${builtinName} requires ${builtin.argCount} parameters and ${givenArguments.length} parameters were entered`
      );
    }

    if (builtin.isReducer) {
      return automapTypesForReducer(
        givenArguments[0],
        getDefined(builtin.functor)
      );
    }

    if (builtin.functorNoAutomap != null) {
      return builtin.functorNoAutomap(givenArguments, givenValues);
    }

    return automapTypes(
      givenArguments,
      ([type, ...rest]) =>
        Type.combine(type, ...rest).mapType(() =>
          getDefined(builtin.functor, 'need a builtin functor')(
            [type, ...rest],
            givenValues
          )
        ),
      builtin.argCardinalities
    );
  }
};
