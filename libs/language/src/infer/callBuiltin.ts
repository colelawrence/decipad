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
      `Unknown function: ${builtinName}`
    );
  }

  const builtin = builtins[builtinName];

  if (givenArguments.length !== builtin.argCount) {
    return Type.Impossible.inNode(callExpr).withErrorCause(
      `${builtinName} expects ${builtin.argCount} parameters and was given ${givenArguments.length}`
    );
  }

  return automapTypes(
    givenArguments,
    (types) => Type.runFunctor(callExpr, builtin.functor, ...types),
    builtin.argCardinalities
  );
};
