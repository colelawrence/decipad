import pSeries from 'p-series';
import type { PromiseOrType } from '@decipad/utils';
import { getDefined, zip } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { Type, AST } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  buildType as t,
  InferError,
  typeIsPending,
} from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { callBuiltinFunctor } from '@decipad/language-builtins';
import { inferExpression, inferStatement } from '.';
import type { Realm } from '..';
import { getIdentifierString } from '../utils';
import type { Context } from './context';
import { logRetrievedFunctionName } from './context';
import { isPrevious } from '../utils/isPrevious';
import { getOfType } from '../parser/getOfType';

export function inferFunctionDefinition(
  ctx: Context,
  statement: AST.FunctionDefinition
): Type {
  const [name, args] = statement.args;
  const fName = getIdentifierString(name);

  ctx.functionDefinitions.set(fName, statement);

  return t.functionPlaceholder(
    fName,
    args.args.map((a) => a.args[0]),
    getOfType('block', statement.args[2]),
    ctx.stack.depth
  );
}

export const internalInferFunction = async (
  realm: Realm,
  funcBody: AST.Block,
  argNames: string[],
  args: Type[],
  depth = 0
) => {
  const { inferContext: ctx } = realm;
  return ctx.scopedToDepth(depth, async () =>
    ctx.stack.withPush(async () => {
      for (const [argDef, arg] of zip(argNames, args)) {
        ctx.stack.set(argDef, arg);
      }

      let returned;
      for (const statement of funcBody.args) {
        // eslint-disable-next-line no-await-in-loop
        returned = await inferStatement(realm, statement);
      }

      return getDefined(returned, 'panic: function did not return');
    })
  );
};

export const inferFunction = async (
  realm: Realm,
  func: AST.FunctionDefinition,
  givenArguments: Type[],
  depth = 0
): Promise<Type> => {
  const [fName, fArgs, fBody] = func.args;
  if (givenArguments.length !== fArgs.args.length) {
    const error = InferError.expectedArgCount(
      getIdentifierString(fName),
      fArgs.args.length,
      givenArguments.length
    );

    return t.impossible(error);
  }
  return internalInferFunction(
    realm,
    fBody,
    fArgs.args.map((a) => getIdentifierString(a)),
    givenArguments,
    depth
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
  // eslint-disable-next-line @typescript-eslint/promise-function-async
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
