import { getDefined, getInstanceof, zip } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import {
  AST,
  InferError,
  Type,
  Value,
  buildType as t,
} from '@decipad/language-types';
import { getIdentifierString } from '../utils';
import { Realm } from '../interpreter';
import { inferTableColumn } from './inference';
import { evaluateTableColumn } from './evaluate';
import { shouldEvaluate } from './shouldEvaluate';

export const inferColumnAssign = async (
  realm: Realm,
  assign: AST.TableColumnAssign
): Promise<Type> => {
  const { inferContext: ctx } = realm;
  if (!ctx.stack.isInGlobalScope) {
    return t.impossible(InferError.forbiddenInsideFunction('table'));
  }

  const [tableNameAst, colNameAst, , sortOrder] = assign.args;
  const tableName = getIdentifierString(tableNameAst);
  const columnName = getIdentifierString(colNameAst);

  const table = await ctx.stack.get(tableName)?.isTable();

  if (table == null || table?.errorCause) {
    return table ?? t.impossible(InferError.missingVariable(tableName));
  }

  if (ctx.stack.hasNamespaced([tableName, columnName], 'function')) {
    return t.impossible(InferError.duplicateTableColumn(columnName));
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
  realm: Realm,
  assign: AST.TableColumnAssign
): Promise<Value.Value> {
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
    await table.tableRowCount()
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
