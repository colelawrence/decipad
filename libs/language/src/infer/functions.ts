import pSeries from 'p-series';
import { inferExpression, inferStatement } from '.';
import { AST } from '..';
import { callBuiltinFunctor } from '../builtins';
import { build as t, InferError, Type } from '../type';
import { getDefined, getIdentifierString, getOfType, zip } from '../utils';
import { Context } from './context';

export function inferFunctionDefinition(
  ctx: Context,
  statement: AST.FunctionDefinition
): Type {
  const [name, args] = statement.args;
  const fName = getIdentifierString(name);

  ctx.functionDefinitions.set(fName, statement);

  return t.functionPlaceholder(fName, args.args.length);
}

export const inferFunction = async (
  ctx: Context,
  func: AST.FunctionDefinition,
  givenArguments: Type[]
): Promise<Type> => {
  return ctx.stack.withPushCall(async () => {
    const [fName, fArgs, fBody] = func.args;

    if (givenArguments.length !== fArgs.args.length) {
      const error = InferError.expectedArgCount(
        getIdentifierString(fName),
        fArgs.args.length,
        givenArguments.length
      );

      return t.impossible(error);
    }

    for (const [argDef, arg] of zip(fArgs.args, givenArguments)) {
      ctx.stack.set(getIdentifierString(argDef), arg);
    }

    let returned;
    for (const statement of fBody.args) {
      // eslint-disable-next-line no-await-in-loop
      returned = await inferStatement(ctx, statement);
    }

    return getDefined(returned, 'panic: function did not return');
  });
};

/** set while calling a function to avoid infinite recursion */
const isCurrentlyCallingFunctions = new Set<string>();

export async function inferFunctionCall(ctx: Context, expr: AST.FunctionCall) {
  const fName = getIdentifierString(expr.args[0]);
  const fArgs = getOfType('argument-list', expr.args[1]).args;
  const givenArguments: Type[] = await pSeries(
    fArgs.map((arg) => () => inferExpression(ctx, arg))
  );

  if (fName === 'previous') {
    return givenArguments[0];
  }

  const functionDefinition = ctx.functionDefinitions.get(fName);

  if (functionDefinition != null) {
    if (isCurrentlyCallingFunctions.has(fName)) {
      return t.impossible(InferError.formulaCannotCallItself(fName));
    }
    try {
      isCurrentlyCallingFunctions.add(fName);
      return await inferFunction(ctx, functionDefinition, givenArguments);
    } finally {
      isCurrentlyCallingFunctions.delete(fName);
    }
  } else {
    return callBuiltinFunctor(ctx, fName, givenArguments, fArgs);
  }
}
