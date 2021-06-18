import { builtins, hasBuiltin } from '../builtins';
import { Type } from '../type';
import { automapTypes } from '../dimtools';

export const callBuiltin = (
  callExpr: AST.FunctionCall,
  builtinName: string,
  ...givenArguments: Type[]
) => {
  if (!hasBuiltin(builtinName)) {
    return Type.Impossible.inNode(callExpr).withErrorCause(
      `The function ${builtinName} does not exist`
    );
  }

  const builtin = builtins[builtinName];

  if (givenArguments.length !== builtin.argCount) {
    return Type.Impossible.inNode(callExpr).withErrorCause(
      `The function ${builtinName} requires ${builtin.argCount} parameters and ${givenArguments.length} parameters were entered`
    );
  }

  return automapTypes(
    givenArguments,
    (types) => Type.runFunctor(callExpr, builtin.functor, ...types),
    builtin.argCardinalities
  );
};
