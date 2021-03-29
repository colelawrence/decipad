import { walk, getIdentifierString, isExpression, zip } from '../utils';
import { evaluate } from './evaluate';
import { Realm } from './Realm';
import { Column, Scalar, Table, SimpleValue } from './Value';

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

export const evaluateRecursiveColumn = (
  realm: Realm,
  column: AST.Expression,
  rowCount: number
): SimpleValue => {
  if (!usesRecursion(column)) {
    return evaluate(realm, column);
  } else {
    if (realm.previousValue != null) {
      throw new Error('panic: column must not contain another column');
    }

    const rows: Scalar[] = [];

    for (let i = 0; i < rowCount; i++) {
      const value = evaluate(realm, column)
        .withRowCount(rowCount)
        .atIndex(i)
        .asScalar();
      realm.previousValue = value;
      rows.push(value);
    }

    realm.previousValue = null;
    return Column.fromValues(rows);
  }
};

export const getLargestColumn = (values: SimpleValue[]): number => {
  const sizes: Set<number> = new Set(values.map((v) => v.rowCount ?? 0));

  // Make sure it can't be empty
  sizes.add(0);

  return Math.max(...sizes);
};

export const castToLargestRowCount = (values: SimpleValue[]): Column[] => {
  const largestSize = getLargestColumn(values);

  return values.map((value) => value.withRowCount(largestSize));
};

export const castToColumns = (table: { [col: string]: SimpleValue }): Table => {
  const colNames = Object.keys(table);
  const columns = castToLargestRowCount(Object.values(table));

  return new Table(new Map(zip(colNames, columns)));
};
