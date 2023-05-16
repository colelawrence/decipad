import pSeries from 'p-series';
import { PromiseOrType } from '@decipad/utils';
import { inferExpression, inferStatement } from '.';
import { AST } from '..';
import { callBuiltinFunctor } from '../builtins';
import { buildType as t, InferError, Type, typeIsPending } from '../type';
import { getDefined, getIdentifierString, getOfType, zip } from '../utils';
import { Context, logRetrievedFunctionName } from './context';

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

const continueInferFunctionCall = async (
  ctx: Context,
  expr: AST.FunctionCall
): Promise<Type> => {
  const fName = getIdentifierString(expr.args[0]);
  const fArgs = getOfType('argument-list', expr.args[1]).args;
  const givenArguments = await pSeries(
    fArgs.map((arg) => async () => inferExpression(ctx, arg))
  );
  if (fName === 'previous') {
    return givenArguments[0];
  }

  // pending is contagious
  const pending = givenArguments.find(typeIsPending);
  if (pending) {
    return pending;
  }

  logRetrievedFunctionName(ctx, fName);

  const functionDefinition = ctx.functionDefinitions.get(fName);

  if (functionDefinition != null) {
    return inferFunction(ctx, functionDefinition, givenArguments);
  } else {
    return callBuiltinFunctor(ctx, fName, givenArguments, fArgs);
  }
};

// IMPORTANT: keep this function below synchronous, otherwise the guard is not guaranteed.
// eslint-disable-next-line @typescript-eslint/promise-function-async
const guardFunctionCallInfer = (
  ctx: Context,
  expr: AST.FunctionCall
): Promise<Type> => {
  const fName = getIdentifierString(expr.args[0]);
  const functionDefinition = ctx.functionDefinitions.get(fName);
  if (functionDefinition != null) {
    if (ctx.onGoingFunctionCalls.has(fName)) {
      return Promise.resolve(
        t.impossible(InferError.formulaCannotCallItself(fName))
      );
    }
  }
  ctx.onGoingFunctionCalls.add(fName);
  return continueInferFunctionCall(ctx, expr).finally(() => {
    ctx.onGoingFunctionCalls.delete(fName);
  });
};

export const inferFunctionCall = (
  ctx: Context,
  expr: AST.FunctionCall
): PromiseOrType<Type> => guardFunctionCallInfer(ctx, expr);
