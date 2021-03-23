import * as tf from '@tensorflow/tfjs-core';
import { Table, isTable } from './types';
import { getTensorWithTargets } from './getTensor';

export const getTensorsData = async (
  tensors: (tf.Tensor | Table)[]
): Promise<Interpreter.Value> => {
  const toDispose = [];
  const targetValues: Interpreter.Value = [];

  for (const t of tensors) {
    if (isTable(t)) {
      const table = new Map();
      targetValues.push(table);

      for (const [key, value] of Object.entries(t)) {
        table.set(key, await value.data());
        toDispose.push(value);
      }
    } else if (t.shape.length === 0) {
      targetValues.push((await t.data())[0]);
      toDispose.push(t);
    } else {
      targetValues.push([...(await t.data())]);
      toDispose.push(t);
    }
  }

  for (const tensor of toDispose) {
    tensor.dispose();
  }

  return targetValues;
};

// calls getTensorWithTargets to get a nice tensor, gets its data and disposes it.
export const run = async (
  program: AST.Block[],
  desiredTargets: Array<string | number | [number, number]>
): Promise<Interpreter.Value> => {
  const combinedTensor = tf.tidy(() =>
    getTensorWithTargets(program, desiredTargets)
  );

  return await getTensorsData(combinedTensor);
};
