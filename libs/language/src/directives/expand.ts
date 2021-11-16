import { getDefined } from '@decipad/utils';

import type { AST, Context, Type } from '..';
import { inferExpression } from '../infer';
import { evaluate, Realm, Value } from '../interpreter';

import type { Directive, GetTypeCtx, GetValueCtx } from './types';

export const getType = (
  ctx: Context,
  getType: Directive['getType'],
  args: AST.Node[]
): Promise<Type> => {
  const directiveContext: GetTypeCtx = {
    infer: (exp) => inferExpression(ctx, exp),
  };

  return getType(directiveContext, ...args);
};

export const getValue = (
  realm: Realm,
  getValue: Directive['getValue'],
  args: AST.Node[]
): Promise<Value> => {
  const directiveContext: GetValueCtx = {
    evaluate: (exp) => evaluate(realm, exp),
    getNodeType: (node) =>
      getDefined(
        realm.inferContext.nodeTypes.get(node),
        `panic: Could not find node type for ${node.type}`
      ),
  };

  return getValue(directiveContext, ...args);
};
