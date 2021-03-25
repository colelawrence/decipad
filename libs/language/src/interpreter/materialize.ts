import * as tf from '@tensorflow/tfjs-core';
import { Value, Column, Table, Range, AnyValue } from './Value';

async function asyncTidy<T>(fn: () => Promise<T>): Promise<T> {
  try {
    tf.engine().startScope();
    return await fn();
  } finally {
    tf.engine().endScope();
  }
}

export const materializeMultiple = async (
  values: AnyValue[]
): Promise<Interpreter.Result> => {
  return asyncTidy(async () => {
    const materialized = [];

    for (const value of values) {
      materialized.push(await materializeOne(value));
    }

    return materialized;
  });
};

export const materializeOne = async (
  value: AnyValue
): Promise<Interpreter.OneResult> => {
  return asyncTidy(async () => {
    const v = value as AnyValue;

    if (v instanceof Value || v instanceof Column || v instanceof Range) {
      return await v.getData();
    } else if (v instanceof Table) {
      const out = new Map();

      for (const [colName, column] of v.columns.entries()) {
        out.set(colName, await column.getData());
      }

      return out;
    } else {
      throw new Error('panic: unknown value type');
    }
  });
};
