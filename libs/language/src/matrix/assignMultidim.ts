import { getDefined } from '@decipad/utils';
import { map } from '@decipad/generator-utils';
import { AST, Column, Type } from '..';
import { evaluate, Realm, RuntimeError } from '../interpreter';
import { ColumnLikeValue, Value, isColumnLike } from '../value';
import { buildType as t, InferError } from '../type';
import { getIndexName } from './getVariable';
import { matchTargets } from './matcher';

export async function inferMultidimAssignment(
  dimension: Type,
  assignee: Type,
  previousMatrix?: Type
) {
  let returnedCellType = assignee.cellType ?? assignee;

  if (previousMatrix) {
    returnedCellType = await returnedCellType.sameAs(previousMatrix.reduced());
  }

  return t.column(returnedCellType, getIndexName(dimension));
}

export async function evaluateMultidimAssignment(
  realm: Realm,
  node: AST.MatrixAssign,
  dimension: ColumnLikeValue
): Promise<ColumnLikeValue> {
  const [, matchers, assigneeExp] = node.args;
  const [matchCount, matches] = await matchTargets(
    realm.inferContext,
    realm,
    matchers
  );

  const assignee = await evaluate(realm, assigneeExp);

  let getAssignee = async (): Promise<Value> => Promise.resolve(assignee);
  if (isColumnLike(assignee)) {
    // There must be one item for each match
    if ((await assignee.rowCount()) !== matchCount) {
      throw new RuntimeError(new InferError('Mismatched column sizes'));
    }

    let targetIndex = 0;
    getAssignee = async () => getDefined(await assignee.atIndex(targetIndex++));
  }

  const gen = (start?: number, end?: number) =>
    map(dimension.values(start, end), async (valueInCol, index) => {
      if (matches[index]) {
        return getAssignee();
      } else {
        return valueInCol;
      }
    });

  return Column.fromGenerator(gen);
}
