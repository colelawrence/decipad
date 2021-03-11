import * as tf from "@tensorflow/tfjs-core";
import { getTensorWithTargets } from "./getTensor";

// calls getTensorWithTargets to get a nice tensor, gets its data and disposes it.
export const run = async (
  program: AST.Block[],
  desiredTargets: Array<string | number | [number, number]>
): Promise<Map<string | number | [number, number], number>> => {
  const combinedTensor = tf.tidy(() =>
    getTensorWithTargets(program, desiredTargets)
  );

  const targetValues = await combinedTensor.data();

  combinedTensor.dispose(); // GC the tensor

  return new Map(desiredTargets.map((key, i) => [key, targetValues[i]]));
};
