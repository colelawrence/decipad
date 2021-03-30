import { evaluateTargets } from './evaluate';
import { n } from '../utils';

export const run = async (
  program: AST.Block[],
  desiredTargets: Array<string | number | [number, number]>
): Promise<Interpreter.Result> =>
  evaluateTargets(program, desiredTargets).map((v) => v.getData());

export const runOne = async (statement: AST.Statement) => {
  const [result] = await run([n('block', statement)], [0]);

  return result;
};
