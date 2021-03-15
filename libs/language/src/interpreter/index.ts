import * as tf from "@tensorflow/tfjs-core";
import { getTensorWithTargets } from "./getTensor";

// calls getTensorWithTargets to get a nice tensor, gets its data and disposes it.
export const run = async (
  program: AST.Block[],
  desiredTargets: Array<string | number | [number, number]>
): Promise<number[]> => {
  const combinedTensor = tf.tidy(() =>
    getTensorWithTargets(program, desiredTargets)
  );

  const targetValues = await combinedTensor.data();

  combinedTensor.dispose(); // GC the tensor

  return [...targetValues]
};
