import { getDefined } from '@decipad/utils';
import { AST, Column, Type } from '..';
import { evaluate, Realm, RuntimeError } from '../interpreter';
import { ColumnLikeValue, Value, isColumnLike } from '../value';
import { buildType as t, InferError } from '../type';
import { getIndexName } from './getVariable';
import { matchTargets } from './matcher';

export function inferMultidimAssignment(
  dimension: Type,
  assignee: Type,
  previousMatrix?: Type
) {
  let returnedCellType = assignee.cellType ?? assignee;

  if (previousMatrix) {
    returnedCellType = returnedCellType.sameAs(previousMatrix.reduced());
  }

  return t.column(returnedCellType, getIndexName(dimension));
}

export async function evaluateMultidimAssignment(
  realm: Realm,
  node: AST.MatrixAssign,
  dimension: ColumnLikeValue
) {
  const [, matchers, assigneeExp] = node.args;
  const [matchCount, matches] = await matchTargets(
    realm.inferContext,
    realm,
    matchers
  );

  const assignee = await evaluate(realm, assigneeExp);

  let getAssignee = (): Value => assignee;
  if (isColumnLike(assignee)) {
    // There must be one item for each match
    if (assignee.values.length !== matchCount) {
      throw new RuntimeError(new InferError('Mismatched column sizes'));
    }

    let targetIndex = 0;
    getAssignee = () => getDefined(assignee.atIndex(targetIndex++));
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
