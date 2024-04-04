import { getDefined } from '@decipad/utils';
import { map } from '@decipad/generator-utils';
// eslint-disable-next-line no-restricted-imports
import type { AST, Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  InferError,
  RuntimeError,
  Value,
  buildType as t,
} from '@decipad/language-types';
import type { Realm } from '../interpreter';
import { evaluate } from '../interpreter';
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
  dimension: Value.ColumnLikeValue
): Promise<Value.ColumnLikeValue> {
  const [, matchers, assigneeExp] = node.args;
  const [matchCount, matches] = await matchTargets(
    realm.inferContext,
    realm,
    matchers
  );

  const assignee = await evaluate(realm, assigneeExp);

  let getAssignee = async (): Promise<Value.Value> => Promise.resolve(assignee);
  if (Value.isColumnLike(assignee)) {
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

  return Value.Column.fromGenerator(gen);
}
