import { getDefined } from '@decipad/utils';

import { AST, Column, Type } from '..';
import { evaluate, Realm, RuntimeError } from '../interpreter';
import { ColumnLike, isColumnLike } from '../value';
import { buildType as t, InferError } from '../type';
import { getIndexName } from './getVariable';
import { matchTargets } from './matcher';

export function inferMultidimAssignment(
  dimension: Type,
  assignee: Type,
  // eslint-disable-next-line default-param-last
  outColumnSize = dimension.columnSize,
  previousMatrix?: Type
) {
  let returnedCellType = assignee;
  if (assignee.cellType != null) {
    returnedCellType = assignee.reduced();
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
  dimension: ColumnLike
) {
  const [, matchers, assigneeExp] = node.args;
  const [matchCount, matches] = await matchTargets(
    realm.inferContext,
    realm,
    matchers
  );

  const assignee = await evaluate(realm, assigneeExp);

  let getAssignee = () => assignee;
  if (isColumnLike(assignee)) {
    // There must be one item for each match
    if (assignee.values.length !== matchCount) {
      throw new RuntimeError(new InferError('Mismatched column sizes'));
    }

    let targetIndex = 0;
    getAssignee = () => assignee.atIndex(targetIndex++);
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
