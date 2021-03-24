import * as tf from '@tensorflow/tfjs-core';
import { walk, getIdentifierString, isExpression, zip } from '../utils';
import { getTensor } from './getTensor';
import { Realm } from './Realm';
import { Column, Value, Table } from './Value';

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

const atIndex = (col: Column, index: number): Value => {
  if (index <= col.rowCount) {
    const slice = tf.slice(col.tensors, [index], [1]);
    return new Value(tf.reshape(slice, []));
  } else {
    throw new Error('index out of range: ' + index);
  }
};

export const evaluateRecursiveColumn = (
  realm: Realm,
  column: AST.Expression,
  rowCount: number
): Column | Value => {
  if (!usesRecursion(column)) {
    return getTensor(realm, column);
  } else {
    if (realm.previousValue != null) {
      throw new Error('panic: column must not contain another column');
    }

    const rows = [];

    for (let i = 0; i < rowCount; i++) {
      const value = atIndex(getTensor(realm, column).withRowCount(rowCount), i);
      realm.previousValue = value;
      rows.push(tf.reshape(value.tensor, [1]));
    }

    realm.previousValue = null;
    return new Column(tf.concat(rows) as tf.Tensor1D);
  }
};

export const getLargestColumn = (values: (Value | Column)[]): number => {
  const sizes: Set<number> = new Set(values.map((v) => v.rowCount ?? 0));

  // Make sure it can't be empty
  sizes.add(0);

  return Math.max(...sizes);
};

export const castToLargestRowCount = (values: (Value | Column)[]): Column[] => {
  const largestSize = getLargestColumn(values);

  return values.map((value) => value.withRowCount(largestSize));
};

export const castToColumns = (table: {
  [col: string]: Value | Column;
}): Table => {
  const colNames = Object.keys(table);
  const columns = castToLargestRowCount(Object.values(table));

  return new Table(new Map(zip(colNames, columns)));
};
