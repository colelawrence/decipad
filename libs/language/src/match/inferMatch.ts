/* eslint-disable no-await-in-loop */
import { getDefined } from '@decipad/utils';
import type { AST, Type } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { buildType as t } from '@decipad/language-types';
import { inferExpression } from '../infer';
import type { TRealm } from '../scopedRealm';

const inferMatchDef = async (
  realm: TRealm,
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
  realm: TRealm,
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
