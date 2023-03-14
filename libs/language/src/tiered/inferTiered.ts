/* eslint-disable no-await-in-loop */
import { Context, inferExpression } from '../infer';
import { AST } from '../parser';
import { Type, buildType as t } from '../type';
import { getIdentifierString } from '../utils';

export const predicateSymbols = new Set(['rest', 'max', 'min']);

const isPredicate = (exp: AST.Expression): boolean => {
  if (exp.type === 'ref') {
    return predicateSymbols.has(getIdentifierString(exp));
  }
  return false;
};

const inferTieredDef = async (
  initialType: Type,
  ctx: Context,
  def: AST.TieredDef
): Promise<Type> => {
  return ctx.stack.withPush(async () => {
    ctx.stack.set('tier', initialType);
    ctx.stack.set('slice', initialType);

    const [condition, result] = def.args;
    let conditionType: Type | undefined;
    if (!isPredicate(condition)) {
      conditionType = (await inferExpression(ctx, condition))
        .isScalar('number')
        .sameAs(initialType);
    }
    const resultType = await inferExpression(ctx, result);
    if (conditionType?.errorCause) {
      return conditionType;
    }
    return resultType;
  });
};

export const inferTiered = async (
  ctx: Context,
  node: AST.Tiered
): Promise<Type> => {
  const [initial, ...tieredDefs] = node.args;
  const argType = (await inferExpression(ctx, initial)).isScalar('number');

  if (!tieredDefs.length) {
    return t.impossible('tiered definitions are empty');
  }
  return (
    await Promise.all(
      tieredDefs.map((def) => inferTieredDef(argType, ctx, def))
    )
  ).reduce((type, other) => type.sameAs(other));
};
