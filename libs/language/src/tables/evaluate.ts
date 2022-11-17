import { getDefined, zip } from '@decipad/utils';
import { AST } from '..';
import { refersToOtherColumnsByName } from './inference';
import { Column, ColumnLike, Row, RuntimeError, Table, Value } from '../value';
import { mapWithPrevious } from '../interpreter/previous';
import {
  walkAst,
  getIdentifierString,
  isExpression,
  getInstanceof,
} from '../utils';
import { Realm, evaluate } from '../interpreter';
import { coerceTableColumnIndices } from './dimensionCoersion';

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
  tableColumns: Map<string, ColumnLike>,
  column: AST.Expression,
  indexName: string,
  rowCount?: number
): Promise<ColumnLike> => {
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
  otherColumns: Map<string, ColumnLike>,
  column: AST.Expression,
  rowCount: number
): Promise<ColumnLike> =>
  realm.stack.withPush(async () => {
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
  const tableColumns = new Map<string, ColumnLike>();
  const { args: items } = table;
  const tableName = getDefined(realm.getTypeAt(table).indexName);

  if (items.length === 0) {
    return Table.fromMapping({});
  }

  let tableLength: number | undefined;
  return realm.stack.withPush(async () => {
    const addColumn = (name: string, value: ColumnLike) => {
      tableLength ??= value.rowCount;

      if (tableLength !== value.rowCount) {
        // UI tables will never place us in this situation
        throw new RuntimeError('Inconsistent table column sizes');
      }

      tableColumns.set(name, value);
      realm.stack.set(name, value);
      realm.stack.set(tableName, Table.fromMapping(tableColumns));
    };

    for (const item of items) {
      if (item.type === 'table-column') {
        const [def, column] = item.args;
        const colName = getIdentifierString(def);
        // eslint-disable-next-line no-await-in-loop
        const columnData = await evaluateTableColumn(
          realm,
          tableColumns,
          column,
          tableName,
          tableLength
        );

        addColumn(colName, columnData);
      } else if (item.type === 'table-spread') {
        // eslint-disable-next-line no-await-in-loop
        const baseTable = await evaluate(realm, item.args[0]);

        const { columnNames, columns } = getInstanceof(baseTable, Table);
        for (const [name, value] of zip(getDefined(columnNames), columns)) {
          addColumn(name, value);
        }
        // istanbul ignore else
      } else {
        throw new Error('panic: unreachable');
      }
    }

    return Table.fromMapping(tableColumns);
  });
};

export const getProperty = (object: Value, property: string): Value => {
  if (object instanceof Row) {
    return object.getCell(property);
  } else {
    return getInstanceof(object, Table).getColumn(property);
  }
};
