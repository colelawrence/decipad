import { zip } from '@decipad/utils';
import { AST } from '..';
import { Context } from '../infer';
import { build as t, InferError } from '../type';
import { getDefined, getIdentifierString, getInstanceof } from '../utils';
import { Realm } from '../interpreter';
import { Table, UnknownValue, Value } from '../value';
import { inferTableColumn } from './inference';
import { evaluateTableColumn } from './evaluate';
import { shouldEvaluate } from './shouldEvaluate';

export const inferColumnAssign = async (
  ctx: Context,
  assign: AST.TableColumnAssign
) => {
  if (!ctx.stack.isInGlobalScope) {
    return t.impossible(InferError.forbiddenInsideFunction('table'));
  }

  const [tableNameAst, colNameAst] = assign.args;
  const tableName = getIdentifierString(tableNameAst);
  const columnName = getIdentifierString(colNameAst);

  const table = ctx.stack.get(tableName)?.isTable();

  if (table == null || table?.errorCause) {
    return table ?? t.impossible(InferError.missingVariable(tableName));
  }

  if (ctx.stack.hasNamespaced([tableName, columnName], 'function')) {
    return t.impossible(InferError.duplicateTableColumn(columnName));
  }

  const newColumnAtParentIndex = getDefined(table.columnNames).length;

  const newColumn = await inferTableColumn(ctx, {
    columnAst: assign,
    tableName,
    columnName,
  });

  if (newColumn.errorCause) {
    return newColumn;
  }

  return t.column(newColumn, 'unknown', tableName, newColumnAtParentIndex);
};

export async function evaluateColumnAssign(
  realm: Realm,
  assign: AST.TableColumnAssign
): Promise<Value> {
  const [tableNameAst, tableColAst, expAst] = assign.args;

  const tableName = getIdentifierString(tableNameAst);
  const columnName = getIdentifierString(tableColAst);

  if (!shouldEvaluate(realm, tableName, columnName)) {
    return UnknownValue;
  }

  const table = getInstanceof(getDefined(realm.stack.get(tableName)), Table);

  const columns = new Map(zip(table.columnNames, table.columns));

  const newColumn = await evaluateTableColumn(
    realm,
    columns,
    expAst,
    tableName,
    table.tableRowCount
  );

  realm.stack.setNamespaced(
    [tableName, columnName],
    newColumn,
    'function',
    realm.statementId
  );

  return getDefined(
    realm.stack.getNamespaced([tableName, columnName], 'function')
  );
}
