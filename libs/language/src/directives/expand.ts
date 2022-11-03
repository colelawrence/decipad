import { getDefined } from '@decipad/utils';

import type { AST, Context, Type } from '..';
import { inferExpression } from '../infer';
import { evaluate, Realm } from '../interpreter';
import { Value } from '../value';

import type { Directive, GetTypeCtx, GetValueCtx } from './types';

export const getType = (
  root: AST.Expression,
  ctx: Context,
  getType: Directive['getType'],
  args: AST.Node[]
): Promise<Type> => {
  const directiveContext: GetTypeCtx = {
    infer: (exp) => inferExpression(ctx, exp),
  };

  return getType(root, directiveContext, args);
};

export const getValue = (
  root: AST.Expression,
  realm: Realm,
  getValue: Directive['getValue'],
  args: AST.Node[]
): Promise<Value> => {
  const directiveContext: GetValueCtx = {
    evaluate: (exp) => evaluate(realm, exp),
    getNodeType: (node) => {
      return getDefined(
        realm.inferContext.nodeTypes.get(node),
        `panic: Could not find node type for ${node.type}`
      );
    },
  };

  return getValue(root, directiveContext, args);
};
