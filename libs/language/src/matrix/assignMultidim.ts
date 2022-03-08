import { getDefined } from '@decipad/utils';

import { AST, Column, Type } from '..';
import { evaluate, Realm, RuntimeError } from '../interpreter';
import { build as t, InferError } from '../type';
import { equalOrUnknown } from '../utils';
import { getIndexName } from './getVariable';
import { matchTargets } from './matcher';

export function inferMultidimAssignment(
  dimension: Type,
  assignee: Type,
  outColumnSize = dimension.columnSize,
  previousMatrix?: Type
) {
  let returnedCellType = assignee;
  if (assignee.columnSize) {
    returnedCellType = equalOrUnknown(assignee.columnSize, assignee.columnSize)
      ? assignee.reduced()
      : t.impossible('Expected compatible column size');
  } else {
    returnedCellType = assignee;
  }

  if (previousMatrix) {
    returnedCellType = returnedCellType.sameAs(previousMatrix.reduced());
  }

  return t.column(
    returnedCellType,
    getDefined(outColumnSize),
    getIndexName(dimension)
  );
}

export async function evaluateMultidimAssignment(
  realm: Realm,
  node: AST.MatrixAssign,
  dimension: Column
) {
  const [, matchers, assigneeExp] = node.args;
  const [matchCount, matches] = await matchTargets(realm, matchers);

  const assignee = await evaluate(realm, assigneeExp);

  let getAssignee = () => assignee;
  if (assignee instanceof Column) {
    // There must be one item for each match
    if (assignee.values.length !== matchCount) {
      throw new RuntimeError(new InferError('Mismatched column sizes'));
    }

    let targetIndex = 0;
    getAssignee = () => assignee.values[targetIndex++];
  }

  return Column.fromValues(
    dimension.values.map((valueInCol, index) => {
      if (matches[index]) {
        return getAssignee();
      } else {
        return valueInCol;
      }
    })
  );
}
