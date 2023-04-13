import { getDefined } from '@decipad/utils';
import { AST } from '..';
import { refersToOtherColumnsByName } from './inference';
import { Column, ColumnLikeValue, Row, Table, Value } from '../value';
import { mapWithPrevious } from '../interpreter/previous';
import {
  walkAst,
  getIdentifierString,
  isExpression,
  getInstanceof,
} from '../utils';
import { Realm, evaluate } from '../interpreter';
import { coerceTableColumnIndices } from './dimensionCoersion';
import { shouldEvaluate } from './shouldEvaluate';

const isRecursiveReference = (expr: AST.Expression) =>
  expr.type === 'function-call' &&
  getIdentifierString(expr.args[0]) === 'previous';

export const usesRecursion = (expr: AST.Expression) => {
  let result = false;

  walkAst(expr, (expr) => {
    if (isExpression(expr) && isRecursiveReference(expr)) {
      result = true;
    }
  });

  return result;
};

export const evaluateTableColumn = async (
  realm: Realm,
  tableColumns: Map<string, ColumnLikeValue>,
  column: AST.Expression,
  indexName: string,
  rowCount?: number
): Promise<ColumnLikeValue> => {
  if (
    refersToOtherColumnsByName(column, tableColumns) ||
    usesRecursion(column)
  ) {
    return evaluateTableColumnIteratively(
      realm,
      tableColumns,
      column,
      rowCount ?? 1
    );
  }

  // Evaluate the column as a whole
  return coerceTableColumnIndices(
    realm.getTypeAt(column),
    await evaluate(realm, column),
    indexName,
    rowCount
  );
};

export const evaluateTableColumnIteratively = async (
  realm: Realm,
  otherColumns: Map<string, ColumnLikeValue>,
  column: AST.Expression,
  rowCount: number
): Promise<ColumnLikeValue> =>
  realm.withPush(async () => {
    const cells = await mapWithPrevious(realm, async function* mapper() {
      for (let index = 0; index < rowCount; index++) {
        // Make other cells available
        for (const [otherColName, otherCol] of otherColumns) {
          realm.stack.set(otherColName, otherCol.atIndex(index));
        }
        // eslint-disable-next-line no-await-in-loop
        yield evaluate(realm, column);
      }
    });

    return Column.fromValues(cells);
  });

export const evaluateTable = async (
  realm: Realm,
  table: AST.Table
): Promise<Table> => {
  const tableColumns = new Map<string, ColumnLikeValue>();
  const {
    args: [tName, ...items],
  } = table;

  const tableName = getIdentifierString(tName);
  const indexName = getDefined(realm.getTypeAt(table).indexName);

  realm.stack.createNamespace(tableName, 'function');

  let tableLength: number | undefined;
  return realm.withPush(async () => {
    const addColumn = (name: string, value: ColumnLikeValue) => {
      tableLength ??= value.rowCount;

      tableColumns.set(name, value);
      realm.stack.setNamespaced(
        [tableName, name],
        value,
        'function',
        realm.statementId
      );
    };

    for (const item of items) {
      if (item.type === 'table-column') {
        const [def, column] = item.args;
        const colName = getIdentifierString(def);

        if (!shouldEvaluate(realm, tableName, colName)) {
          // Avoid differing type and value
          continue;
        }

        // eslint-disable-next-line no-await-in-loop
        const columnData = await evaluateTableColumn(
          realm,
          tableColumns,
          column,
          indexName,
          tableLength
        );

        addColumn(colName, columnData);
      } else if (item.type === 'table-spread') {
        throw new Error('unreachable retired feature');
      } else {
        throw new Error('panic: unreachable');
      }
    }

    return getInstanceof(
      getDefined(realm.stack.get(tableName, 'function')),
      Table
    );
  });
};

export const getProperty = (object: Value, property: string): Value => {
  if (object instanceof Row) {
    return object.getCell(property);
  } else {
    return getInstanceof(object, Table).getColumn(property);
  }
};
