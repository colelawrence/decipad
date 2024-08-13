import { getDefined, getInstanceof, zip } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { InferError, Value, buildType as t } from '@decipad/language-types';
import type { AST, Value as ValueTypes } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { getIdentifierString } from '@decipad/language-utils';
import { inferTableColumn } from './inference';
import { evaluateTableColumn } from './evaluate';
import { shouldEvaluate } from './shouldEvaluate';
import type { TRealm } from '../scopedRealm';

export const inferColumnAssign = async (
  realm: TRealm,
  assign: AST.TableColumnAssign
): Promise<Type> => {
  const { inferContext: ctx } = realm;
  if (realm.depth !== 0) {
    return t.impossible(InferError.forbiddenInsideFunction('table'));
  }

  const [tableNameAst, colNameAst, , sortOrder] = assign.args;
  const tableName = getIdentifierString(tableNameAst);
  const columnName = getIdentifierString(colNameAst);

  const table = await ctx.stack.get(tableName)?.isTable();

  if (table == null || table?.errorCause) {
    return table ?? t.impossible(InferError.missingVariable(tableName));
  }

  const newColumnAtParentIndex =
    sortOrder ?? getDefined(table.columnNames).length;

  const newColumn = await inferTableColumn(realm, {
    columnAst: assign,
    tableName,
    columnName,
  });

  if (newColumn.errorCause) {
    return newColumn;
  }

  return t.column(newColumn, tableName, newColumnAtParentIndex);
};

export async function evaluateColumnAssign(
  realm: TRealm,
  assign: AST.TableColumnAssign
): Promise<ValueTypes.Value> {
  const [tableNameAst, tableColAst, expAst] = assign.args;

  const tableName = getIdentifierString(tableNameAst);
  const columnName = getIdentifierString(tableColAst);

  if (!shouldEvaluate(realm, tableName, columnName)) {
    return Value.UnknownValue;
  }

  const table = getInstanceof(
    getDefined(realm.stack.get(tableName)),
    Value.Table
  );

  const columns = new Map(zip(table.columnNames, table.columns));

  const newColumn = await evaluateTableColumn(
    realm,
    columns,
    expAst,
    tableName,
    assign.args[4] ?? (await table.tableRowCount())
  );

  realm.stack.setNamespaced(
    [tableName, columnName],
    newColumn,
    realm.statementId
  );

  const tableType = getDefined(realm.inferContext.stack.get(tableName));
  const [, newTable] = Value.sortValue(
    tableType,
    getDefined(realm.stack.get(tableName))
  );

  if (!newTable || !Value.isTableValue(newTable)) {
    throw new Error('table does not have table value');
  }
  const thisColumnIndex = newTable.columnNames.indexOf(columnName);
  const thisColumn = getDefined(newTable.columns[thisColumnIndex]);

  return thisColumn;
}
