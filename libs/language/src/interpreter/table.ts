import { getDefined, zip } from '@decipad/utils';
import { AST } from '..';
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

const repeat = <T>(value: T, length: number) =>
  Array.from({ length }, () => value);

export const evaluateTable = async (
  realm: Realm,
  table: AST.Table
): Promise<Table> => {
  const colNames: string[] = [];
  const colValues: Value[] = [];
  const { args: items } = table;
  const { tableLength } = realm.getTypeAt(table);

  if (typeof tableLength !== 'number') {
    throw new Error('panic: unknown table length');
  }

  return realm.stack.withPush(async () => {
    const addColumn = (name: string, value: Value) => {
      if (!(value instanceof Column)) {
        value = Column.fromValues(repeat(value, tableLength));
      }

      realm.stack.set(name, value);

      colNames.push(name);
      colValues.push(value);
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
      } else {
        // eslint-disable-next-line no-await-in-loop
        const baseTable = await evaluate(realm, item.args[0]);

        const { columnNames, columns } = getInstanceof(baseTable, Table);
        for (const [name, value] of zip(getDefined(columnNames), columns)) {
          addColumn(name, value);
        }
      }
    }

    return Table.fromNamedColumns(colValues, colNames);
  });
};

export const getProperty = (object: Value, property: string): Value => {
  if (object instanceof Row) {
    return object.getCell(property);
  } else {
    return getInstanceof(object, Table).getColumn(property);
  }
};
