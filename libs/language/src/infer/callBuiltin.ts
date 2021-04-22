import { builtins } from '../builtins';
import { Type } from '../type';
import { reduceTypesThroughDims } from '../dimtools';

export const callBuiltin = (
  callExpr: AST.FunctionCall,
  builtinName: string,
  ...givenArguments: Type[]
) => {
  const builtin = builtins[builtinName];

  if (builtin == null) {
    return Type.Impossible.inNode(callExpr).withErrorCause(
      `Unknown function: ${builtinName}`
    );
  }

  if (givenArguments.length !== builtin.argCount) {
    return Type.Impossible.inNode(callExpr).withErrorCause(
      `${builtinName} expects ${builtin.argCount} parameters and was given ${givenArguments.length}`
    );
  }

  return reduceTypesThroughDims(
    givenArguments,
    (types) => Type.runFunctor(callExpr, builtin.functor, ...types),
    { reduces: builtin.reduces }
  );
};
