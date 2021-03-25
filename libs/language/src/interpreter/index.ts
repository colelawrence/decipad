import "@tensorflow/tfjs-backend-cpu"
import { getTensorForTargets } from './getTensor';
import { materializeMultiple } from './materialize';
import { n } from '../utils';

// calls getTensorForTargets to get a nice tensor, gets its data and disposes it.
export const run = async (
  program: AST.Block[],
  desiredTargets: Array<string | number | [number, number]>
): Promise<Interpreter.Result> =>
  materializeMultiple(getTensorForTargets(program, desiredTargets));

export const runOne = async (statement: AST.Statement) => {
  const [result] = await run([n('block', statement)], [0]);

  return result;
};
