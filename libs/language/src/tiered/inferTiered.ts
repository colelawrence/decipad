/* eslint-disable no-await-in-loop */
import { Context, inferExpression } from '../infer';
import { AST } from '../parser';
import { Type } from '../type';
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
    if (!isPredicate(condition)) {
      const conditionType = (await inferExpression(ctx, condition)).isScalar(
        'number'
      );
      if (conditionType.errorCause) {
        return conditionType;
      }
    }
    return inferExpression(ctx, result);
  });
};

export const inferTiered = async (
  ctx: Context,
  node: AST.Tiered
): Promise<Type> => {
  const [initial, ...tieredDefs] = node.args;
  const initialType = (await inferExpression(ctx, initial)).isScalar('number');
  if (initialType.errorCause) {
    return initialType;
  }

  return tieredDefs.reduce<Promise<Type>>(async (type, def) => {
    const initialType = await type;
    return initialType
      .sameAs(await inferTieredDef(initialType, ctx, def))
      .isScalar('number');
  }, Promise.resolve(initialType));
};
