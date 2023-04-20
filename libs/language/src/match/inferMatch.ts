/* eslint-disable no-await-in-loop */
import { getDefined } from '@decipad/utils';
import { Context, inferExpression } from '../infer';
import { AST } from '../parser';
import { Type, buildType as T } from '../type';

const inferMatchDef = (ctx: Context, def: AST.MatchDef): Type => {
  const [condition, result] = def.args;
  const conditionType = inferExpression(ctx, condition).isScalar('boolean');
  if (conditionType.errorCause) {
    return conditionType;
  }
  return inferExpression(ctx, result);
};

export const inferMatch = (ctx: Context, node: AST.Match): Type => {
  if (node.args.length < 1) {
    return T.nothing();
  }
  let resultType: Type | undefined;
  for (const matchDef of node.args) {
    const matchDefType = inferMatchDef(ctx, matchDef);
    if (matchDefType.pending || matchDefType.errorCause) {
      return matchDefType;
    }
    if (resultType) {
      resultType = resultType.sameAs(matchDefType);
    } else {
      resultType = matchDefType;
    }
    if (resultType.errorCause || resultType.pending) {
      return resultType;
    }
  }
  return getDefined(resultType);
};
