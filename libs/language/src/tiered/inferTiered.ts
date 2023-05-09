/* eslint-disable no-await-in-loop */
import { PromiseOrType } from '@decipad/utils';
import pSeries from 'p-series';
import { Context, inferExpression } from '../infer';
import { AST } from '../parser';
import { Type, buildType as t } from '../type';
import { getIdentifierString } from '../utils';
import { cleanInferred } from './cleanInferred';

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
      conditionType = await (
        await (await inferExpression(ctx, condition)).isScalar('number')
      ).sameAs(initialType);
    }
    if (conditionType?.errorCause) {
      return conditionType;
    }
    return cleanInferred(await inferExpression(ctx, result));
  });
};

export const inferTiered = async (
  ctx: Context,
  node: AST.Tiered
): Promise<Type> => {
  const [initial, ...tieredDefs] = node.args;
  const argType = await inferExpression(ctx, initial);
  if (argType.errorCause || argType.pending) {
    return argType;
  }
  const argTypeNumber = await argType.isScalar('number');
  if (argTypeNumber.errorCause) {
    return argTypeNumber;
  }

  if (!tieredDefs.length) {
    return t.impossible('tiered definitions are empty');
  }
  const types = await pSeries(
    tieredDefs.map((def) => async () => inferTieredDef(argTypeNumber, ctx, def))
  );
  return cleanInferred(
    await types.reduce<PromiseOrType<Type>>(
      async (type, other) => (await type).sameAs(other),
      types[0]
    )
  );
};
