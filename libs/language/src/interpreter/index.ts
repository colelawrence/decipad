import { AST } from '..';
import { n } from '../utils';

import { evaluate } from './evaluate';
import { evaluateTargets } from './selective';
import { Realm } from './Realm';
import * as Interpreter from './interpreter-types';
import { inferProgram } from '../infer';

export { Realm, Interpreter, evaluate };

export const run = async (
  program: AST.Block[],
  desiredTargets: Array<string | number | [number, number]>,
  realm?: Realm
): Promise<Interpreter.Result> => {
  realm = realm ?? new Realm(await inferProgram(program));

  return (await evaluateTargets(program, desiredTargets, realm)).map((v) => {
    return v.getData();
  });
};

export const runOne = async (statement: AST.Statement, realm?: Realm) => {
  const [result] = await run([n('block', statement)], [0], realm);

  return result;
};
