import { getDefined } from '@decipad/utils';

import { AST } from '..';
import { block } from '../utils';
import { inferProgram } from '../infer';

import { evaluate } from './evaluate';
import { evaluateTargets } from './selective';
import { Realm } from './Realm';
import * as Interpreter from './interpreter-types';
import type { Value } from './Value';

export type { Value };
export { RuntimeError } from './RuntimeError';
export { Realm, Interpreter, evaluate };

export const run = async (
  program: AST.Block[],
  desiredTargets: Array<string | number | [number, number]>,
  realm?: Realm
): Promise<Interpreter.OneResult[]> => {
  realm = realm ?? new Realm(await inferProgram(program));

  return (await evaluateTargets(program, desiredTargets, realm)).map((v) => {
    return v.getData();
  });
};

export const runOne = async (statement: AST.Statement, realm?: Realm) => {
  realm = realm ?? new Realm(await inferProgram([block(statement)]));

  const value = await evaluate(realm, statement);
  return value.getData();
};

export const runBlock = async (block: AST.Block, realm?: Realm) => {
  realm = realm ?? new Realm(await inferProgram([block]));

  let last: Value | undefined;
  for (const stmt of block.args) {
    // eslint-disable-next-line no-await-in-loop
    last = await evaluate(realm, stmt);
  }

  return getDefined(last, 'Unexpected empty block').getData();
};
