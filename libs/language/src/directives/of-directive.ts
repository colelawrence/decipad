import produce from 'immer';
import { AST, Context, inferExpression } from '..';
import { automapTypes } from '../dimtools';
import { evaluate, Realm } from '../interpreter';
import { InferError, Type, buildType as t } from '../type';
import { getIdentifierString } from '../utils';
import { DirectiveImpl } from './types';

export const getType: DirectiveImpl<AST.OfDirective>['getType'] = (
  ctx: Context,
  { args: [, expr, quality] }
): Type => {
  const expressionType = inferExpression(ctx, expr);
  if (expressionType.errorCause) {
    return expressionType;
  }
  return automapTypes([expressionType], ([expressionType]: Type[]): Type => {
    return expressionType.isScalar('number').mapType((type): Type => {
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
  });
};

export const getValue: DirectiveImpl<AST.OfDirective>['getValue'] = (
  realm: Realm,
  { args: [, expr] }
) => evaluate(realm, expr);

export const of: DirectiveImpl<AST.OfDirective> = {
  getType,
  getValue,
};
