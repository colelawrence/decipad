import type { PromiseOrType } from '@decipad/utils';
import { getDefined, zip } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { Type, AST } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  buildType as t,
  InferError,
  isPendingType,
} from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { callBuiltinFunctor } from '@decipad/language-builtins';
import { inferExpression, inferStatement } from '.';
import { getIdentifierString } from '../utils';
import { logRetrievedName } from './logRetrievedName';
import { isPrevious } from '../utils/isPrevious';
import { getOfType } from '../parser/getOfType';
import { scopedToDepthAndWithPush, type TRealm } from '../scopedRealm';

export function inferFunctionDefinition(
  realm: TRealm,
  statement: AST.FunctionDefinition
): Type {
  const [name, args] = statement.args;
  const fName = getIdentifierString(name);

  return t.functionPlaceholder(
    fName,
    args.args.map((a) => a.args[0]),
    getOfType('block', statement.args[2]),
    realm.depth
  );
}

export const internalInferFunction = async (
  _realm: TRealm,
  funcBody: AST.Block,
  argNames: string[],
  args: Type[],
  depth = 0
) =>
  scopedToDepthAndWithPush(_realm, depth, 'infer function', async (realm) => {
    const { inferContext: ctx } = realm;
    for (const [argDef, arg] of zip(argNames, args)) {
      ctx.stack.set(argDef, arg);
    }

    let returned;
    for (const statement of funcBody.args) {
      // eslint-disable-next-line no-await-in-loop
      returned = await inferStatement(realm, statement);
    }

    return getDefined(returned, 'panic: function did not return');
  });

export const inferFunction = async (
  realm: TRealm,
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
  realm: TRealm,
  expr: AST.FunctionCall
): Promise<Type> => {
  const fName = getIdentifierString(expr.args[0]);
  const fArgs = getOfType('argument-list', expr.args[1]).args;
  const givenArguments = await Promise.all(
    fArgs.map(async (arg) => inferExpression(realm, arg))
  );
  if (isPrevious(fName)) {
    return givenArguments[0];
  }

  // pending is contagious
  const pending = givenArguments.find(isPendingType);
  if (pending) {
    return pending;
  }

  const { inferContext: ctx } = realm;

  logRetrievedName(ctx, fName);

  const functionType = ctx.stack.get(fName);
  const functionDefinition = functionType?.node;

  if (functionDefinition != null) {
    return inferFunction(
      realm,
      getOfType('function-definition', functionDefinition),
      givenArguments,
      functionType!.functionScopeDepth ?? 0
    );
  } else {
    return callBuiltinFunctor(realm.utils, fName, givenArguments, fArgs);
  }
};

// IMPORTANT: keep this function below synchronous, otherwise the guard is not guaranteed.
// eslint-disable-next-line @typescript-eslint/promise-function-async
const guardFunctionCallInfer = (
  realm: TRealm,
  expr: AST.FunctionCall
  // eslint-disable-next-line @typescript-eslint/promise-function-async
): Promise<Type> => {
  const fName = getIdentifierString(expr.args[0]);
  const { inferContext: ctx } = realm;
  const functionDefinition = ctx.stack.get(fName);
  if (functionDefinition != null && ctx.onGoingFunctionCalls.has(fName)) {
    return Promise.resolve(
      t.impossible(InferError.formulaCannotCallItself(fName))
    );
  }
  ctx.addOngoingFunctionCall(fName);
  return continueInferFunctionCall(realm, expr).finally(() => {
    ctx.removeOngoingFunctionCall(fName);
  });
};

export const inferFunctionCall = (
  realm: TRealm,
  expr: AST.FunctionCall
): PromiseOrType<Type> => guardFunctionCallInfer(realm, expr);
