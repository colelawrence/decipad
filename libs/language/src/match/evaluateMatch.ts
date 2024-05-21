// eslint-disable-next-line no-restricted-imports
import { RuntimeError } from '@decipad/language-types';
import type { AST, Value as ValueTypes } from '@decipad/language-interfaces';
import { evaluate } from '../interpreter';
import type { TRealm } from '../scopedRealm';

const evaluateMatchDef = async (
  realm: TRealm,
  def: AST.MatchDef
): Promise<ValueTypes.Value | undefined> => {
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
): Promise<ValueTypes.Value> => {
  for (const matchDef of node.args) {
    // eslint-disable-next-line no-await-in-loop
    const matchDefValue = await evaluateMatchDef(realm, matchDef);
    if (matchDefValue != null) {
      return matchDefValue;
    }
  }
  throw new RuntimeError(
    'None of the match condition were true. At least one of the conditions must be true.'
  );
};
