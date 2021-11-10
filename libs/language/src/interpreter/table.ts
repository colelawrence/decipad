import { AST } from '..';
import { walk, getIdentifierString, isExpression } from '../utils';
import { evaluate } from './evaluate';
import { mapWithPrevious } from './previous';
import { Realm } from './Realm';
import { Column, Value } from './Value';

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

const atIndex = (v: Value, rowCount: number, index: number): Value => {
  if (!(v instanceof Column)) {
    v = Column.fromValues(Array.from({ length: rowCount }, () => v));
  }

  return (v as Column).atIndex(index);
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
      const value = atIndex(await evaluate(realm, column), rowCount, i);
      realm.previousValue = value;
      yield value;
    }
  });

  return Column.fromValues(rows);
};

const repeat = <T>(value: T, length: number) =>
  Array.from({ length }, () => value);

export const evaluateTable = async (
  realm: Realm,
  table: AST.Table
): Promise<Value> => {
  const colNames: string[] = [];
  const colValues: Value[] = [];
  const { args: items } = table;
  const { tableLength } = realm.getTypeAt(table);

  if (typeof tableLength !== 'number') {
    throw new Error('panic: unknown table length');
  }

  return realm.stack.withPush(async () => {
    for (const item of items) {
      const [def, column] = item.args;
      const colName = getIdentifierString(def);
      // eslint-disable-next-line no-await-in-loop
      const columnData = await evaluateTableColumn(realm, column, tableLength);

      realm.stack.set(colName, columnData);

      colValues.push(
        columnData instanceof Column
          ? columnData
          : Column.fromValues(repeat(columnData, tableLength))
      );
      colNames.push(colName);
    }

    return Column.fromNamedValues(colValues, colNames);
  });
};
