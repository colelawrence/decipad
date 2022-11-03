import produce from 'immer';

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
import { ColumnLike, ValueTransforms } from '../value';

export async function inferMatrixRef(
  context: Context,
  ref: AST.MatrixRef
): Promise<Type> {
  const {
    args: [varExp, matchersExp],
  } = ref;

  const variable = inferVariable(context, getIdentifierString(varExp));
  const matchers = await inferMatchers(context, matchersExp);

  return Type.combine(variable, matchers).mapType(() =>
    produce(variable, (returned) => {
      returned.columnSize = 'unknown';
    })
  );
}

export async function evaluateMatrixRef(
  realm: Realm,
  ref: AST.MatrixRef
): Promise<ColumnLike> {
  const {
    args: [varName, matchers],
  } = ref;

  // variable[dimname == needle]
  const variable = evaluateVariable(realm, getIdentifierString(varName));
  const [, matches] = await matchTargets(realm, matchers);

  // Let's run the matcher against every item in Column
  return ValueTransforms.applyFilterMap(variable, matches);
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
  const [dimName, needle] = readSimpleMatchers(matcher);

  const dimension =
    needle == null
      ? // Variable[DimName] = ...
        inferVariable(context, dimName)
      : // variable[dimname == needle] = ...
        inferVariable(context, varName, dimName);

  let newMatrix: Type;
  if (needle == null) {
    // variable[DimName]
    newMatrix = Type.combine(matchers, dimension).mapType((dim) =>
      inferMultidimAssignment(dim, assignee)
    );
  } else {
    newMatrix = Type.combine(dimension, matchers, assignee)
      .mapType(() =>
        inferMultidimAssignment(dimension, assignee, 'unknown', dimension)
      )
      .mapType((newMatrix) => dimension.sameAs(newMatrix));
  }

  context.stack.set(varName, newMatrix);
  return newMatrix;
}

export async function evaluateMatrixAssign(
  realm: Realm,
  assign: AST.MatrixAssign
): Promise<ColumnLike> {
  const [varRef, matchers] = assign.args;

  const varName = getIdentifierString(varRef);
  const matcher = getOnly(matchers.args);
  const [dimName, needle] = readSimpleMatchers(matcher);

  const dimension =
    needle == null
      ? // Variable[DimName] = ...
        evaluateVariable(realm, dimName)
      : // variable[dimname == needle] = ...
        evaluateVariable(realm, varName);

  const newColumn = await evaluateMultidimAssignment(realm, assign, dimension);

  realm.stack.set(varName, newColumn);
  return newColumn;
}
