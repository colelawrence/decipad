import { AST } from '..';
import { walk, getIdentifierString, isExpression, pairwise } from '../utils';
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
    return await evaluate(realm, column);
  } else {
    const rows = await mapWithPrevious(realm, async function* () {
      for (let i = 0; i < rowCount; i++) {
        const value = atIndex(await evaluate(realm, column), rowCount, i);
        realm.previousValue = value;
        yield value;
      }
    });

    return Column.fromValues(rows);
  }
};

export const getLargestColumn = (values: Value[], minValue = 1): number => {
  const sizes: Set<number> = new Set(
    values.map((v) => (v instanceof Column ? v.rowCount : minValue))
  );

  // Make sure it can't be empty
  sizes.add(minValue);

  return Math.max(...sizes);
};

export const evaluateTable = async (
  realm: Realm,
  { args: columns }: AST.Table
): Promise<Value> => {
  const colNames: string[] = [];
  const colValues: Value[] = [];

  return await realm.stack.withPush(async () => {
    for (const [def, column] of pairwise<AST.ColDef, AST.Expression>(columns)) {
      const colName = getIdentifierString(def);
      const columnData = await evaluateTableColumn(
        realm,
        column,
        getLargestColumn(colValues)
      );

      realm.stack.set(colName, columnData);

      colValues.push(columnData);
      colNames.push(colName);
    }

    return Column.fromNamedValues(colValues, colNames);
  });
};
