import { getDefined } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { AST, Result } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { materializeOneResult } from '@decipad/language-types';
import pSeries from 'p-series';
import { block } from '../utils';
import { inferProgram } from '../infer';
import { Realm } from './Realm';
import { evaluate } from './evaluate';
import { evaluateTargets } from './selective';
// TODO replace these with the ones in src/run, or move them there

export const run = async (
  program: AST.Block[],
  desiredTargets: Array<string | number | [number, number]>,
  realm?: Realm,
  doNotMaterialiseResults?: boolean
): Promise<Result.OneResult[]> => {
  realm = realm ?? new Realm(await inferProgram(program));

  return pSeries(
    (await evaluateTargets(program, desiredTargets, realm)).map(
      (v) => async () =>
        doNotMaterialiseResults
          ? v.getData()
          : materializeOneResult(v.getData())
    )
  );
};

export const runOne = async (statement: AST.Statement, realm?: Realm) => {
  realm = realm ?? new Realm(await inferProgram([block(statement)]));

  const value = await evaluate(realm, statement);
  return value.getData();
};

export const runBlock = async (block: AST.Block, realm?: Realm) => {
  realm = realm ?? new Realm(await inferProgram([block]));

  let last;
  for (const stmt of block.args) {
    // eslint-disable-next-line no-await-in-loop
    last = await evaluate(realm, stmt);
  }

  return getDefined(last, 'Unexpected empty block').getData();
};
