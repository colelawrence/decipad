import { getDefined, unzip, zip } from '@decipad/utils';
import { AST } from '..';
import {
  walk,
  getIdentifierString,
  isExpression,
  getInstanceof,
} from '../utils';
import { evaluate, evaluateBlock } from './evaluate';
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

const atIndex = (v: Value, index: number): Value => {
  if (!(v instanceof Column)) return v;

  return v.atIndex(index);
};

export const evaluateTableColumn = async (
  realm: Realm,
  column: AST.Expression,
  rowCount: number
): Promise<Value> => {
  if (!usesRecursion(column)) {
    return evaluate(realm, column);
  }

  const rows = await mapWithPrevious(realm, async function* mapper() {
    for (let i = 0; i < rowCount; i++) {
      // TODO should this be parallel?
      // eslint-disable-next-line no-await-in-loop
      yield atIndex(await evaluate(realm, column), i);
    }
  });

  return Column.fromValues(rows);
};

const nthRow = (columns: Map<string, Column>, rowIndex: number) => {
  const [cellNames, columnValues] = unzip(columns.entries());
  const cellValues = columnValues.map((col) => col.atIndex(rowIndex));

  return Row.fromNamedCells(cellValues, cellNames);
};

export const evaluateTableFormula = async (
  realm: Realm,
  otherColumns: Map<string, Column>,
  { args: [, currentRowArg, body] }: AST.TableFormula,
  rowCount: number
): Promise<Column> =>
  realm.stack.withPush(async () => {
    const currentRowName = getIdentifierString(currentRowArg);

    const cells = await mapWithPrevious(realm, async function* mapper() {
      for (let index = 0; index < rowCount; index++) {
        realm.stack.top.set(currentRowName, nthRow(otherColumns, index));

        // eslint-disable-next-line no-await-in-loop
        yield evaluateBlock(realm, body);
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
  const { tableLength } = realm.getTypeAt(table);

  if (typeof tableLength !== 'number') {
    throw new Error('panic: unknown table length');
  }

  return realm.stack.withPush(async () => {
    const addColumn = (name: string, value: Column | Value) => {
      if (!(value instanceof Column)) {
        value = Column.fromValues(repeat(value, tableLength));
      }

      realm.stack.set(name, value);

      tableColumns.set(name, value as Column);
    };

    for (const item of items) {
      if (item.type === 'table-column') {
        const [def, column] = item.args;
        const colName = getIdentifierString(def);
        // eslint-disable-next-line no-await-in-loop
        const columnData = await evaluateTableColumn(
          realm,
          column,
          tableLength
        );

        addColumn(colName, columnData);
      } else if (item.type === 'table-formula') {
        const colName = getIdentifierString(item.args[0]);

        // eslint-disable-next-line no-await-in-loop
        const columnData = await evaluateTableFormula(
          realm,
          tableColumns,
          item,
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

    return Table.fromNamedColumns(
      [...tableColumns.values()],
      [...tableColumns.keys()]
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
