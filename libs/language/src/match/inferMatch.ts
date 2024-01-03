/* eslint-disable no-await-in-loop */
import { getDefined } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { AST, Type, buildType as t } from '@decipad/language-types';
import { inferExpression } from '../infer';
import { Realm } from '../interpreter';

const inferMatchDef = async (
  realm: Realm,
  def: AST.MatchDef
): Promise<Type> => {
  const [condition, result] = def.args;
  const conditionType = await (
    await inferExpression(realm, condition)
  ).isScalar('boolean');
  if (conditionType.errorCause) {
    return conditionType;
  }
  return inferExpression(realm, result);
};

export const inferMatch = async (
  realm: Realm,
  node: AST.Match
): Promise<Type> => {
  if (node.args.length < 1) {
    return t.nothing();
  }
  let resultType: Type | undefined;
  for (const matchDef of node.args) {
    const matchDefType = await inferMatchDef(realm, matchDef);
    if (matchDefType.pending || matchDefType.errorCause) {
      return matchDefType;
    }
    if (resultType) {
      resultType = await resultType.sameAs(matchDefType);
    } else {
      resultType = matchDefType;
    }
    if (resultType.errorCause || resultType.pending) {
      return resultType;
    }
  }
  return getDefined(resultType);
};
