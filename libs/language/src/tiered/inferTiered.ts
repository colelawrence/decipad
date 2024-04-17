/* eslint-disable no-await-in-loop */
import type { PromiseOrType } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { AST, Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { buildType as t } from '@decipad/language-types';
import { inferExpression } from '../infer';
import { getIdentifierString } from '../utils';
import { cleanInferred } from './cleanInferred';
import { withPush, type TRealm } from '../scopedRealm';
import { prettyPrintAST } from '../parser/utils';

export const predicateSymbols = new Set(['rest', 'max', 'min']);

const isPredicate = (exp: AST.Expression): boolean => {
  if (exp.type === 'ref') {
    return predicateSymbols.has(getIdentifierString(exp));
  }
  return false;
};

const inferTieredDef = async (
  initialType: Type,
  _realm: TRealm,
  def: AST.TieredDef
): Promise<Type> =>
  withPush(
    _realm,
    async (realm) => {
      const { inferContext: ctx } = realm;
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
    },
    `infer tiered def ${prettyPrintAST(def)}`
  );

export const inferTiered = async (
  realm: TRealm,
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
  const types = await Promise.all(
    tieredDefs.map(async (def) => inferTieredDef(argTypeNumber, realm, def))
  );
  return cleanInferred(
    await types.reduce<PromiseOrType<Type>>(
      async (type, other) => (await type).sameAs(other),
      types[0]
    )
  );
};
