/* eslint-disable no-await-in-loop */
// eslint-disable-next-line no-restricted-imports
import { AST, RuntimeError, Value } from '@decipad/language-types';
import { evaluate, Realm } from '../interpreter';

const evaluateMatchDef = async (
  realm: Realm,
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
  realm: Realm,
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
