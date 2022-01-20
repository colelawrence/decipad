import { getDefined, zip } from '@decipad/utils';
import { AST } from '..';
import { refersToOtherColumnsByName } from '../infer/table';
import {
  walk,
  getIdentifierString,
  isExpression,
  getInstanceof,
} from '../utils';
import { evaluate } from './evaluate';
import { mapWithPrevious } from './previous';
import { Realm } from './Realm';
import { Column, Row, Table, Value } from './Value';

const isRecursiveReference = (expr: AST.Expression) =>
  expr.type === 'function-call' &&
  getIdentifierString(expr.args[0]) === 'previous';

export const usesRecursion = (expr: AST.Expression) => {
  let result = false;

  walk(expr, (expr) => {
    if (isExpression(expr) && isRecursiveReference(expr)) {
      result = true;
    }
  });

  return result;
};

export const evaluateTableColumn = async (
  realm: Realm,
  tableColumns: Map<string, Column>,
  column: AST.Expression,
  rowCount: number
): Promise<Value> => {
  if (
    refersToOtherColumnsByName(column, tableColumns) ||
    usesRecursion(column)
  ) {
    return evaluateTableColumnIteratively(
      realm,
      tableColumns,
      column,
      rowCount
    );
  }

  // Evaluate the column as a whole
  return evaluate(realm, column);
};

export const evaluateTableColumnIteratively = async (
  realm: Realm,
  otherColumns: Map<string, Column>,
  column: AST.Expression,
  rowCount: number
): Promise<Column> =>
  realm.stack.withPush(async () => {
    const cells = await mapWithPrevious(realm, async function* mapper() {
      for (let index = 0; index < rowCount; index++) {
        // Make other cells available
        for (const [otherColName, otherCol] of otherColumns) {
          realm.stack.top.set(otherColName, otherCol.atIndex(index));
        }
        // eslint-disable-next-line no-await-in-loop
        yield evaluate(realm, column);
      }
    });

    return Column.fromValues(cells);
  });

const repeat = <T>(value: T, length: number) =>
  Array.from({ length }, () => value);

export const evaluateTable = async (
  realm: Realm,
  table: AST.Table
): Promise<Table> => {
  const tableColumns = new Map<string, Column>();
  const { args: items } = table;
  const { tableLength, indexName } = realm.getTypeAt(table);

  if (typeof tableLength !== 'number') {
    throw new Error('panic: unknown table length');
  }

  return realm.stack.withPush(async () => {
    const addColumn = (name: string, value: Column | Value) => {
      if (!(value instanceof Column)) {
        value = Column.fromValues(repeat(value, tableLength));
      }

      tableColumns.set(name, value as Column);
      realm.stack.set(name, value);
      realm.stack.set(getDefined(indexName), Table.fromMapping(tableColumns));
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
