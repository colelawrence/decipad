import { getDefined } from '@decipad/utils';
import { type AST, type Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { materializeOneResult, Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { block } from '@decipad/language-utils';
import { inferProgram } from '../infer';
import { evaluate } from './evaluate';
import { evaluateTargets } from './selective';
import type { TRealm } from '../scopedRealm';
import { ScopedRealm } from '../scopedRealm/ScopedRealm';
// TODO replace these with the ones in src/run, or move them there

export const run = async (
  program: AST.Block[],
  desiredTargets: Array<string | number | [number, number]>,
  realm?: TRealm,
  doNotMaterialiseResults?: boolean
): Promise<Array<[Result.OneResult, Result.ResultMetadata]>> => {
  realm = realm ?? new ScopedRealm(undefined, await inferProgram(program));

  return Promise.all(
    (await evaluateTargets(program, desiredTargets, realm)).map(async (v) =>
      v != null
        ? doNotMaterialiseResults
          ? [await v.getData(), Value.getValueMeta(v)]
          : [await materializeOneResult(v.getData()), Value.getValueMeta(v)]
        : [undefined, undefined]
    )
  );
};

export const runOne = async (statement: AST.Statement, realm?: TRealm) => {
  realm =
    realm ?? new ScopedRealm(undefined, await inferProgram([block(statement)]));

  const value = await evaluate(realm, statement);
  return value.getData();
};

export const runBlock = async (block: AST.Block, realm?: TRealm) => {
  realm = realm ?? new ScopedRealm(undefined, await inferProgram([block]));

  let last;
  for (const stmt of block.args) {
    // eslint-disable-next-line no-await-in-loop
    last = await evaluate(realm, stmt);
  }

  return getDefined(last, 'Unexpected empty block').getData();
};
