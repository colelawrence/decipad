import { produce } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import {
  type AST,
  Dimension,
  InferError,
  type Type,
  buildType as t,
} from '@decipad/language-types';
import type { TRealm } from '..';
import { inferExpression } from '..';
import { evaluate } from '../interpreter';
import { getIdentifierString } from '../utils';
import { type DirectiveImpl } from './types';

export const getType: DirectiveImpl<AST.OfDirective>['getType'] = async (
  realm: TRealm,
  { args: [, expr, quality] }
) => {
  const expressionType = await inferExpression(realm, expr);
  if (expressionType.errorCause || expressionType.pending) {
    return expressionType;
  }
  return Dimension.automapTypes(
    realm.utils,
    [expressionType],
    async ([expressionType]: Type[]) => {
      return (await expressionType.isScalar('number')).mapType((type): Type => {
        if (!type.unit || type.unit.length !== 1) {
          return t.impossible(InferError.needOneAndOnlyOneUnit());
        }

        return produce(type, (t) => {
          if (t.unit) {
            t.unit[0] = produce(t.unit[0], (u) => {
              u.quality = getIdentifierString(quality);
            });
          }
        });
      });
    }
  );
};

export const getValue: DirectiveImpl<AST.OfDirective>['getValue'] = async (
  realm: TRealm,
  { args: [, expr] }
) => evaluate(realm, expr);

export const of: DirectiveImpl<AST.OfDirective> = {
  getType,
  getValue,
};
