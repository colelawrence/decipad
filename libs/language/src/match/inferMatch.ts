/* eslint-disable no-await-in-loop */
import { getDefined } from '@decipad/utils';
import { Context, inferExpression } from '../infer';
import { AST } from '../parser';
import { Type, build as T } from '../type';

const inferMatchDef = async (
  ctx: Context,
  def: AST.MatchDef
): Promise<Type> => {
  const [condition, result] = def.args;
  const conditionType = (await inferExpression(ctx, condition)).isScalar(
    'boolean'
  );
  if (conditionType.errorCause) {
    return conditionType;
  }
  return inferExpression(ctx, result);
};

export const inferMatch = async (
  ctx: Context,
  node: AST.Match
): Promise<Type> => {
  if (node.args.length < 1) {
    return T.nothing();
  }
  let resultType: Type | undefined;
  for (const matchDef of node.args) {
    const matchDefType = await inferMatchDef(ctx, matchDef);
    if (resultType) {
      resultType = resultType.sameAs(matchDefType);
    } else {
      resultType = matchDefType;
    }
    if (resultType.errorCause) {
      return resultType;
    }
  }
  return getDefined(resultType);
};
