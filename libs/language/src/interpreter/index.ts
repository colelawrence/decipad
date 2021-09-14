import { AST } from '..';
import { n } from '../utils';

import { evaluate } from './evaluate';
import { evaluateTargets } from './selective';
import { Realm } from './Realm';
import * as Interpreter from './interpreter-types';

export { Realm, Interpreter, evaluate };

export const run = async (
  program: AST.Block[],
  desiredTargets: Array<string | number | [number, number]>,
  realm = new Realm()
): Promise<Interpreter.Result> =>
  (await evaluateTargets(program, desiredTargets, realm)).map((v) =>
    v.getData()
  );

export const runOne = async (statement: AST.Statement, realm = new Realm()) => {
  const [result] = await run([n('block', statement)], [0], realm);

  return result;
};
