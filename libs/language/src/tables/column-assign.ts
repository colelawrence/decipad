import produce from 'immer';
import { zip } from '@decipad/utils';

import { AST } from '..';
import { Context } from '../infer';
import { build as t, InferError } from '../type';
import { getDefined, getIdentifierString, getInstanceof } from '../utils';
import { Realm } from '../interpreter';
import { Table, Value } from '../value';
import { pushStackAndPrevious } from '../infer/context';
import { inferTableColumn } from './inference';
import { evaluateTableColumn } from './evaluate';

export async function inferColumnAssign(
  ctx: Context,
  assign: AST.TableColumnAssign
) {
  if (!ctx.stack.isInGlobalScope) {
    return t.impossible(InferError.forbiddenInsideFunction('table'));
  }

  const [tableNameAst, colNameAst] = assign.args;
  const tableName = getIdentifierString(tableNameAst);
  const colName = getIdentifierString(colNameAst);

  const table = ctx.stack.get(tableName)?.isTable();

  if (table == null || table.errorCause) {
    return table ?? t.impossible(InferError.missingVariable(tableName));
  }

  const columnNames = getDefined(table.columnNames);
  const columnTypes = getDefined(table.columnTypes);
  const indexName = getDefined(table.indexName);

  const newColumn = await pushStackAndPrevious(ctx, async () => {
    const otherColumnsEntries = zip(columnNames, columnTypes).map(
      ([name, type]) => {
        return [name, t.column(type, 'unknown', indexName)] as const;
      }
    );

    const otherColumns = new Map(otherColumnsEntries);

    // Make other columns available
    ctx.stack.setMulti(otherColumns);

    return inferTableColumn(ctx, {
      otherColumns,
      columnAst: assign,
      indexName,
    });
  });

  if (newColumn.errorCause) {
    return newColumn;
  }

  const updatedTable = table
    .isTable()
    .canAddTableColumn(colName)
    .mapType(
      produce((table) => {
        table.columnNames = [...columnNames, colName];
        table.columnTypes = [...columnTypes, newColumn.reduced()];
      })
    );

  if (updatedTable.errorCause) {
    return updatedTable;
  }

  ctx.stack.set(tableName, updatedTable, 'global');

  return newColumn;
}

export async function evaluateColumnAssign(
  realm: Realm,
  assign: AST.TableColumnAssign
): Promise<Value> {
  const [tableNameAst, tableColAst, expAst] = assign.args;
  const tableName = getIdentifierString(tableNameAst);

  const table = getInstanceof(getDefined(realm.stack.get(tableName)), Table);

  const columns = new Map(zip(table.columnNames, table.columns));

  const newColumn = await evaluateTableColumn(
    realm,
    columns,
    expAst,
    tableName,
    table.tableRowCount
  );

  columns.set(getIdentifierString(tableColAst), newColumn);

  const newTable = Table.fromMapping(columns);
  realm.stack.set(tableName, newTable);

  return newColumn;
}
