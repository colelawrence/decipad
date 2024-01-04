import pSeries from 'p-series';
import { PromiseOrType, getDefined, zip } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import {
  buildType as t,
  InferError,
  Type,
  typeIsPending,
  AST,
} from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { callBuiltinFunctor } from '@decipad/language-builtins';
import { inferExpression, inferStatement } from '.';
import { Realm } from '..';
import { getIdentifierString, getOfType } from '../utils';
import { Context, logRetrievedFunctionName } from './context';
import { isPrevious } from '../utils/isPrevious';

export function inferFunctionDefinition(
  ctx: Context,
  statement: AST.FunctionDefinition
): Type {
  const [name, args] = statement.args;
  const fName = getIdentifierString(name);

  ctx.functionDefinitions.set(fName, statement);

  return t.functionPlaceholder(fName, args.args.length, ctx.stack.depth);
}

export const inferFunction = async (
  realm: Realm,
  func: AST.FunctionDefinition,
  givenArguments: Type[],
  depth = 0
): Promise<Type> => {
  const { inferContext: ctx } = realm;
  return ctx.scopedToDepth(depth, async () =>
    ctx.stack.withPush(async () => {
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
        returned = await inferStatement(realm, statement);
      }

      return getDefined(returned, 'panic: function did not return');
    })
  );
};

const continueInferFunctionCall = async (
  realm: Realm,
  expr: AST.FunctionCall
): Promise<Type> => {
  const fName = getIdentifierString(expr.args[0]);
  const fArgs = getOfType('argument-list', expr.args[1]).args;
  const givenArguments = await pSeries(
    fArgs.map((arg) => async () => inferExpression(realm, arg))
  );
  if (isPrevious(fName)) {
    return givenArguments[0];
  }

  // pending is contagious
  const pending = givenArguments.find(typeIsPending);
  if (pending) {
    return pending;
  }

  const { inferContext: ctx } = realm;

  logRetrievedFunctionName(ctx, fName);

  const functionDefinition = ctx.functionDefinitions.get(fName);

  if (functionDefinition != null) {
    return inferFunction(
      realm,
      functionDefinition,
      givenArguments,
      functionDefinition.inferredType?.functionScopeDepth ?? 0
    );
  } else {
    return callBuiltinFunctor(realm.utils, fName, givenArguments, fArgs);
  }
};

// IMPORTANT: keep this function below synchronous, otherwise the guard is not guaranteed.
// eslint-disable-next-line @typescript-eslint/promise-function-async
const guardFunctionCallInfer = (
  realm: Realm,
  expr: AST.FunctionCall
): Promise<Type> => {
  const fName = getIdentifierString(expr.args[0]);
  const { inferContext: ctx } = realm;
  const functionDefinition = ctx.functionDefinitions.get(fName);
  if (functionDefinition != null) {
    if (ctx.onGoingFunctionCalls.has(fName)) {
      return Promise.resolve(
        t.impossible(InferError.formulaCannotCallItself(fName))
      );
    }
  }
  ctx.onGoingFunctionCalls.add(fName);
  return continueInferFunctionCall(realm, expr).finally(() => {
    ctx.onGoingFunctionCalls.delete(fName);
  });
};

export const inferFunctionCall = (
  realm: Realm,
  expr: AST.FunctionCall
): PromiseOrType<Type> => guardFunctionCallInfer(realm, expr);
