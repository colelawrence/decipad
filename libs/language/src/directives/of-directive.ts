import produce from 'immer';
import { AST } from '..';
import { automapTypes } from '../dimtools';
import { InferError, Type, build as t } from '../type';
import { getIdentifierString, getOfType } from '../utils';
import { Directive, GetTypeCtx, GetValueCtx } from './types';

const cleanAST = (...args: AST.Node[]) =>
  [
    args[0] as AST.Expression,
    getIdentifierString(getOfType('generic-identifier', args[1])),
  ] as const;

export const getType: Directive['getType'] = async (
  _: AST.Expression,
  { infer }: GetTypeCtx,
  args
): Promise<Type> => {
  const [expr, quality] = cleanAST(...args);
  const expressionType = await infer(expr);
  if (expressionType.errorCause) {
    return expressionType;
  }
  return automapTypes([expressionType], ([expressionType]: Type[]): Type => {
    return expressionType.isScalar('number').mapType((type): Type => {
      if (!type.unit || type.unit.args.length !== 1) {
        return t.impossible(InferError.needOneAndOnlyOneUnit());
      }

      return produce(type, (t) => {
        if (t.unit) {
          t.unit.args[0] = produce(t.unit.args[0], (u) => {
            u.quality = quality;
          });
        }
      });
    });
  });
};

export const getValue: Directive['getValue'] = (
  _root: AST.Expression,
  { evaluate }: GetValueCtx,
  [expression]: [AST.Expression, AST.Identifier]
) => {
  return evaluate(expression);
};

export const of: Directive = {
  argCount: 2,
  getType,
  getValue,
};
