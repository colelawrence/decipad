import { getOnly } from '@decipad/utils';

import { AST, Context, Type } from '..';
import { inferExpression } from '../infer';
import { Realm } from '../interpreter';
import { getIdentifierString } from '../utils';
import {
  evaluateMultidimAssignment,
  inferMultidimAssignment,
} from './assignMultidim';
import { evaluateVariable, inferVariable } from './getVariable';
import { inferMatchers, matchTargets, readSimpleMatchers } from './matcher';
import { ColumnLikeValue, applyFilterMap } from '../value';
import { typeIsPending } from '../type';

export async function inferMatrixRef(
  context: Context,
  ref: AST.MatrixRef
): Promise<Type> {
  const [varExp, matchersExp] = ref.args;

  const variable = await inferVariable(context, getIdentifierString(varExp));
  const matchers = await inferMatchers(context, matchersExp);

  // pending is contagious
  const pending = [variable, matchers].find(typeIsPending);
  if (pending) {
    return pending;
  }

  return Type.combine(matchers, variable);
}

export async function evaluateMatrixRef(
  realm: Realm,
  ref: AST.MatrixRef
): Promise<ColumnLikeValue> {
  const {
    args: [varName, matchers],
  } = ref;

  // variable[dimname == needle]
  const variable = evaluateVariable(realm, getIdentifierString(varName));
  const [, matches] = await matchTargets(realm.inferContext, realm, matchers);

  // Let's run the matcher against every item in Column
  return applyFilterMap(variable, matches);
}

export async function inferMatrixAssign(
  context: Context,
  assign: AST.MatrixAssign
): Promise<Type> {
  const {
    args: [varExp, matchersExp, assigneeExp],
  } = assign;

  const varName = getIdentifierString(varExp);
  const matchers = await inferMatchers(context, matchersExp);
  const assignee = await inferExpression(context, assigneeExp);

  const matcher = getOnly(matchersExp.args);
  const [dimName, needle] = readSimpleMatchers(context, matcher);

  const dimension = await (needle == null
    ? // Variable[DimName] = ...
      inferVariable(context, dimName)
    : // variable[dimname == needle] = ...
      inferVariable(context, varName, dimName));

  let newMatrix: Type;
  if (needle == null) {
    // variable[DimName]
    newMatrix = await (
      await Type.combine(matchers, dimension)
    ).mapType(async (dim) => inferMultidimAssignment(await dim, assignee));
  } else {
    newMatrix = await (
      await (
        await Type.combine(dimension, matchers, assignee)
      ).mapType(async () =>
        inferMultidimAssignment(dimension, assignee, dimension)
      )
    ).mapType(async (newMatrix) => dimension.sameAs(newMatrix));
  }

  context.stack.set(varName, newMatrix, 'function', context.statementId);
  return newMatrix;
}

export async function evaluateMatrixAssign(
  realm: Realm,
  assign: AST.MatrixAssign
): Promise<ColumnLikeValue> {
  const [varRef, matchers] = assign.args;

  const varName = getIdentifierString(varRef);
  const matcher = getOnly(matchers.args);
  const [dimName, needle] = readSimpleMatchers(realm.inferContext, matcher);

  const dimension =
    needle == null
      ? // Variable[DimName] = ...
        evaluateVariable(realm, dimName)
      : // variable[dimname == needle] = ...
        evaluateVariable(realm, varName);

  const newColumn = await evaluateMultidimAssignment(realm, assign, dimension);

  realm.stack.set(varName, newColumn, 'function', realm.statementId);
  return newColumn;
}
