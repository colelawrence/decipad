/* eslint-disable no-await-in-loop */
import { PromiseOrType } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { AST, Type, buildType as t } from '@decipad/language-types';
import pSeries from 'p-series';
import { inferExpression } from '../infer';
import { getIdentifierString } from '../utils';
import { cleanInferred } from './cleanInferred';
import { Realm } from '../interpreter';

export const predicateSymbols = new Set(['rest', 'max', 'min']);

const isPredicate = (exp: AST.Expression): boolean => {
  if (exp.type === 'ref') {
    return predicateSymbols.has(getIdentifierString(exp));
  }
  return false;
};

const inferTieredDef = async (
  initialType: Type,
  realm: Realm,
  def: AST.TieredDef
): Promise<Type> => {
  const { inferContext: ctx } = realm;
  return ctx.stack.withPush(async () => {
    ctx.stack.set('tier', initialType);
    ctx.stack.set('slice', initialType);

    const [condition, result] = def.args;
    let conditionType: Type | undefined;
    if (!isPredicate(condition)) {
      conditionType = await (
        await (await inferExpression(realm, condition)).isScalar('number')
      ).sameAs(initialType);
    }
    if (conditionType?.errorCause) {
      return conditionType;
    }
    return cleanInferred(await inferExpression(realm, result));
  });
};

export const inferTiered = async (
  realm: Realm,
  node: AST.Tiered
): Promise<Type> => {
  const [initial, ...tieredDefs] = node.args;
  const argType = await inferExpression(realm, initial);
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
    tieredDefs.map(
      (def) => async () => inferTieredDef(argTypeNumber, realm, def)
    )
  );
  return cleanInferred(
    await types.reduce<PromiseOrType<Type>>(
      async (type, other) => (await type).sameAs(other),
      types[0]
    )
  );
};
