import * as tf from '@tensorflow/tfjs-core';
import { Value, Column, Range } from './Value';

it('can be turned into a scalar value', async () => {
  const oneNumber = new Value(tf.tensor(1));
  const columnOfOne = new Column(tf.tensor([1]));
  const columnOfMany = new Column(tf.tensor([1, 2, 3]));

  expect(oneNumber.asValue()).toEqual(oneNumber);
  expect(columnOfOne.asValue()).toBeInstanceOf(Value);
  expect(await columnOfOne.asValue().getData()).toEqual(1);

  expect(() => columnOfMany.asValue()).toThrow();
});

it('can be turned into something of the desired row count', async () => {
  const oneNumber = new Value(tf.tensor(1));
  const column = new Column(tf.tensor([1, 2, 3]));

  expect(await oneNumber.withRowCount(3).getData()).toEqual([1, 1, 1]);
  expect(await column.withRowCount(3).getData()).toEqual([1, 2, 3]);
  expect(() => column.withRowCount(10)).toThrow(/panic:/);
});

it('can represent a range', async () => {
  const range = new Range(tf.tensor(0), tf.tensor(10));

  expect(await range.getData()).toEqual([0, 10]);
});
