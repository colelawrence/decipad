/* eslint-disable no-await-in-loop */
// eslint-disable-next-line no-restricted-imports
import type { AST, Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { RuntimeError } from '@decipad/language-types';
import { evaluate } from '../interpreter';
import type { TRealm } from '../scopedRealm';

const evaluateMatchDef = async (
  realm: TRealm,
  def: AST.MatchDef
): Promise<Value.Value | undefined> => {
  const [condition, result] = def.args;
  const conditionValue = await evaluate(realm, condition);
  if (await conditionValue.getData()) {
    return evaluate(realm, result);
  }
  return undefined;
};

export const evaluateMatch = async (
  realm: TRealm,
  node: AST.Match
): Promise<Value.Value> => {
  for (const matchDef of node.args) {
    const matchDefValue = await evaluateMatchDef(realm, matchDef);
    if (matchDefValue != null) {
      return matchDefValue;
    }
  }
  throw new RuntimeError(
    'None of the match condition were true. At least one of the conditions must be true.'
  );
};
